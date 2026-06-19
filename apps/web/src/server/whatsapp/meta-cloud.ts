import {
  WhatsappMessageDirection,
  WhatsappMessageStatus,
  WhatsappProvider,
  type Prisma,
  type WhatsappConnection,
} from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { serverEnv } from "@/lib/config/server-env";
import { getPrisma } from "@/server/db/prisma";
import { decryptFieldValue } from "@/server/security/field-encryption";
import {
  formatStaffOrderMessage,
  type OrderForWhatsappMessage,
} from "@/server/whatsapp/message-format";
import {
  applyWhatsappStaffAction,
  type WhatsappStaffAction,
} from "@/server/whatsapp/staff-actions";

const META_ACTION_PREFIX = "napcart:order_action";
const DEFAULT_META_API_BASE_URL = "https://graph.facebook.com";
const DEFAULT_META_API_VERSION = "v23.0";

type MetaInteractiveReply = {
  id?: unknown;
  title?: unknown;
};

type MetaWebhookMessage = {
  from?: unknown;
  id?: unknown;
  timestamp?: unknown;
  type?: unknown;
  interactive?: {
    type?: unknown;
    button_reply?: MetaInteractiveReply;
    list_reply?: MetaInteractiveReply;
  };
};

type MetaWebhookChange = {
  value?: {
    metadata?: {
      phone_number_id?: unknown;
      display_phone_number?: unknown;
    };
    contacts?: Array<unknown>;
    messages?: MetaWebhookMessage[];
    statuses?: Array<unknown>;
  };
};

type MetaWebhookPayload = {
  object?: unknown;
  entry?: Array<{
    id?: unknown;
    changes?: MetaWebhookChange[];
  }>;
};

function getMetaActionSecret() {
  return (
    process.env.WHATSAPP_META_ACTION_SECRET ?? serverEnv.supabaseServiceRoleKey
  );
}

function signMetaAction({
  restaurantId,
  orderId,
  action,
}: {
  restaurantId: string;
  orderId: string;
  action: WhatsappStaffAction;
}) {
  return createHmac("sha256", getMetaActionSecret())
    .update(`${restaurantId}:${orderId}:${action}`)
    .digest("base64url");
}

function verifyMetaActionToken({
  restaurantId,
  orderId,
  action,
  token,
}: {
  restaurantId: string;
  orderId: string;
  action: WhatsappStaffAction;
  token: string;
}) {
  const expected = signMetaAction({ restaurantId, orderId, action });
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(token);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function buildMetaOrderActionId({
  restaurantId,
  orderId,
  action,
}: {
  restaurantId: string;
  orderId: string;
  action: WhatsappStaffAction;
}) {
  const token = signMetaAction({ restaurantId, orderId, action });

  return `${META_ACTION_PREFIX}:${orderId}:${action}:${token}`;
}

function parseMetaOrderActionId(
  actionId: string,
): { action: WhatsappStaffAction; orderId: string; token: string } | null {
  const [prefixA, prefixB, orderId, action, token] = actionId.split(":");

  if (
    `${prefixA}:${prefixB}` !== META_ACTION_PREFIX ||
    (action !== "confirm" && action !== "cancel") ||
    !orderId ||
    !token
  ) {
    return null;
  }

  return {
    action,
    orderId,
    token,
  };
}

function getMetaApiUrl(connection: WhatsappConnection) {
  const apiBaseUrl =
    connection.apiBaseUrl ??
    process.env.WHATSAPP_META_API_BASE_URL ??
    DEFAULT_META_API_BASE_URL;
  const apiVersion =
    process.env.WHATSAPP_META_GRAPH_API_VERSION ?? DEFAULT_META_API_VERSION;

  return `${apiBaseUrl.replace(/\/$/, "")}/${apiVersion}/${connection.phoneNumberId}/messages`;
}

function getMetaButtonTitle(action: WhatsappStaffAction) {
  return action === "confirm" ? "Confirm" : "Cancel";
}

export function buildMetaOrderInteractivePayload({
  order,
  connection,
}: {
  order: OrderForWhatsappMessage;
  connection: WhatsappConnection;
}) {
  if (!connection.phoneNumberId) {
    throw new Error(
      "Meta Cloud WhatsApp connection is missing a phone number ID.",
    );
  }

  const confirmActionId = buildMetaOrderActionId({
    restaurantId: order.restaurantId,
    orderId: order.id,
    action: "confirm",
  });
  const cancelActionId = buildMetaOrderActionId({
    restaurantId: order.restaurantId,
    orderId: order.id,
    action: "cancel",
  });

  return {
    endpoint: getMetaApiUrl(connection),
    body: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: connection.displayPhoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        header: {
          type: "text",
          text: `Order ${order.orderNumber}`,
        },
        body: {
          text: formatStaffOrderMessage(order),
        },
        footer: {
          text: connection.businessName || "Restaurant order",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: confirmActionId,
                title: getMetaButtonTitle("confirm"),
              },
            },
            {
              type: "reply",
              reply: {
                id: cancelActionId,
                title: getMetaButtonTitle("cancel"),
              },
            },
          ],
        },
      },
    },
  };
}

export async function createMetaCloudWhatsappOrderLog({
  tx,
  order,
  restaurantId,
  branchId,
  connection,
}: {
  tx: Prisma.TransactionClient;
  order: OrderForWhatsappMessage;
  restaurantId: string;
  branchId: string;
  connection: WhatsappConnection;
}) {
  const payload = buildMetaOrderInteractivePayload({ order, connection });

  return tx.whatsappMessageLog.create({
    data: {
      restaurantId,
      branchId,
      orderId: order.id,
      whatsappConnectionId: connection.id,
      direction: WhatsappMessageDirection.OUTBOUND,
      messageType: "meta_cloud_new_order_interactive",
      payloadJson: {
        provider: WhatsappProvider.META_CLOUD,
        dryRun: true,
        ...payload,
      },
      responseJson: {
        mode: "meta_cloud_phase6a",
        note: "Meta Cloud API payload prepared and logged. Live sending is deferred until credentials are enabled.",
      },
      status: WhatsappMessageStatus.QUEUED,
    },
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getInteractiveReplyId(message: MetaWebhookMessage) {
  if (message.type !== "interactive") {
    return null;
  }

  return (
    readString(message.interactive?.button_reply?.id) ??
    readString(message.interactive?.list_reply?.id)
  );
}

function getWebhookEvents(payload: MetaWebhookPayload) {
  const events: Array<{
    displayPhoneNumber: string | null;
    entryId: string | null;
    message: MetaWebhookMessage;
    phoneNumberId: string | null;
  }> = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      for (const message of value?.messages ?? []) {
        events.push({
          displayPhoneNumber: readString(value?.metadata?.display_phone_number),
          entryId: readString(entry.id),
          message,
          phoneNumberId: readString(value?.metadata?.phone_number_id),
        });
      }
    }
  }

  return events;
}

export function verifyMetaWebhookSignature({
  rawBody,
  signatureHeader,
}: {
  rawBody: string;
  signatureHeader: string | null;
}) {
  const appSecret = process.env.WHATSAPP_META_APP_SECRET;
  const allowUnsigned =
    process.env.NODE_ENV !== "production" &&
    process.env.WHATSAPP_META_ALLOW_UNSIGNED_WEBHOOKS === "true";

  if (!appSecret) {
    return {
      ok: allowUnsigned,
      reason: allowUnsigned
        ? "Meta app secret not configured; unsigned local webhook accepted."
        : "Meta app secret is required in production.",
    };
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return {
      ok: false,
      reason: "Missing X-Hub-Signature-256 header.",
    };
  }

  const expected = `sha256=${createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);

  return {
    ok:
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer),
    reason: "Signature verification completed.",
  };
}

export async function verifyMetaWebhookToken(verifyToken: string) {
  if (process.env.WHATSAPP_META_WEBHOOK_VERIFY_TOKEN === verifyToken) {
    return true;
  }

  const connections = await getPrisma().whatsappConnection.findMany({
    where: {
      provider: WhatsappProvider.META_CLOUD,
      isActive: true,
    },
    select: { id: true, webhookVerifyTokenEncrypted: true },
  });

  return connections.some(
    (connection) =>
      decryptFieldValue(connection.webhookVerifyTokenEncrypted) === verifyToken,
  );
}

async function logUnprocessableMetaWebhookEvent({
  actionId,
  connection,
  errorMessage,
  event,
  providerMessageId,
}: {
  actionId: string | null;
  connection: WhatsappConnection;
  errorMessage: string;
  event: Prisma.InputJsonValue;
  providerMessageId: string | null;
}) {
  await getPrisma().whatsappMessageLog.create({
    data: {
      restaurantId: connection.restaurantId,
      branchId: connection.branchId,
      whatsappConnectionId: connection.id,
      direction: WhatsappMessageDirection.INBOUND,
      messageType: "meta_cloud_webhook_unprocessed",
      providerMessageId,
      payloadJson: {
        actionId,
        event,
        provider: WhatsappProvider.META_CLOUD,
      },
      responseJson: {
        accepted: false,
      },
      status: WhatsappMessageStatus.FAILED,
      errorMessage,
      receivedAt: new Date(),
      processedAt: new Date(),
    },
  });
}

export async function processMetaCloudWebhookPayload(
  payload: unknown,
): Promise<{
  failed: number;
  ignored: number;
  processed: number;
  results: Array<{
    action?: WhatsappStaffAction;
    error?: string;
    messageId: string | null;
    orderNumber?: string;
    status: "failed" | "ignored" | "processed";
  }>;
}> {
  if (!isObject(payload)) {
    throw new Error("Meta webhook payload must be an object.");
  }

  const webhookPayload = payload as MetaWebhookPayload;
  const events = getWebhookEvents(webhookPayload);
  const results: Array<{
    action?: WhatsappStaffAction;
    error?: string;
    messageId: string | null;
    orderNumber?: string;
    status: "failed" | "ignored" | "processed";
  }> = [];

  for (const event of events) {
    const providerMessageId = readString(event.message.id);
    const actionId = getInteractiveReplyId(event.message);

    if (!event.phoneNumberId) {
      results.push({
        error: "Missing phone number ID.",
        messageId: providerMessageId,
        status: "ignored",
      });
      continue;
    }

    const connection = await getPrisma().whatsappConnection.findFirst({
      where: {
        provider: WhatsappProvider.META_CLOUD,
        phoneNumberId: event.phoneNumberId,
        isActive: true,
      },
      orderBy: [{ branchId: "desc" }, { createdAt: "asc" }],
    });

    if (!connection) {
      results.push({
        error:
          "No active Meta Cloud WhatsApp connection matched this phone number ID.",
        messageId: providerMessageId,
        status: "ignored",
      });
      continue;
    }

    if (!actionId) {
      await logUnprocessableMetaWebhookEvent({
        actionId,
        connection,
        errorMessage:
          "Webhook message is not a NapCart interactive order action.",
        event: event as Prisma.InputJsonValue,
        providerMessageId,
      });
      results.push({
        error: "Unsupported webhook message type.",
        messageId: providerMessageId,
        status: "ignored",
      });
      continue;
    }

    const parsedAction = parseMetaOrderActionId(actionId);

    if (!parsedAction) {
      await logUnprocessableMetaWebhookEvent({
        actionId,
        connection,
        errorMessage: "Interactive action ID does not match NapCart format.",
        event: event as Prisma.InputJsonValue,
        providerMessageId,
      });
      results.push({
        error: "Invalid NapCart action ID.",
        messageId: providerMessageId,
        status: "failed",
      });
      continue;
    }

    const order = await getPrisma().order.findFirst({
      where: {
        id: parsedAction.orderId,
        restaurantId: connection.restaurantId,
      },
      select: {
        id: true,
        orderNumber: true,
        restaurantId: true,
      },
    });

    if (!order) {
      await logUnprocessableMetaWebhookEvent({
        actionId,
        connection,
        errorMessage: "Order could not be found for Meta action.",
        event: event as Prisma.InputJsonValue,
        providerMessageId,
      });
      results.push({
        action: parsedAction.action,
        error: "Order not found.",
        messageId: providerMessageId,
        status: "failed",
      });
      continue;
    }

    const isValidToken = verifyMetaActionToken({
      restaurantId: order.restaurantId,
      orderId: order.id,
      action: parsedAction.action,
      token: parsedAction.token,
    });

    if (!isValidToken) {
      await logUnprocessableMetaWebhookEvent({
        actionId,
        connection,
        errorMessage: "Meta action token is invalid.",
        event: event as Prisma.InputJsonValue,
        providerMessageId,
      });
      results.push({
        action: parsedAction.action,
        error: "Invalid action token.",
        messageId: providerMessageId,
        orderNumber: order.orderNumber,
        status: "failed",
      });
      continue;
    }

    const result = await applyWhatsappStaffAction({
      action: parsedAction.action,
      inboundPayload: event as Prisma.InputJsonValue,
      messageType: "meta_cloud_staff_order_action",
      orderId: order.id,
      provider: WhatsappProvider.META_CLOUD,
      providerMessageId,
      restaurantId: order.restaurantId,
      responseContext: {
        displayPhoneNumber: event.displayPhoneNumber,
        entryId: event.entryId,
        phoneNumberId: event.phoneNumberId,
      },
    });

    results.push({
      action: parsedAction.action,
      messageId: providerMessageId,
      orderNumber: result.orderNumber,
      status: "processed",
    });
  }

  return {
    failed: results.filter((result) => result.status === "failed").length,
    ignored: results.filter((result) => result.status === "ignored").length,
    processed: results.filter((result) => result.status === "processed").length,
    results,
  };
}
