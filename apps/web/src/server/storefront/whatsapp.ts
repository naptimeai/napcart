import {
  FulfillmentType,
  OrderStatus,
  OrderStatusChangeSource,
  WhatsappMessageDirection,
  WhatsappMessageStatus,
  WhatsappProvider,
  type Order,
  type OrderItemAddon,
  type OrderItem,
  type Prisma,
  type WhatsappConnection,
} from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { serverEnv } from "@/lib/config/server-env";
import { runInTransaction } from "@/server/db/transaction";

type OrderForMessage = Order & {
  items: Array<OrderItem & { addons?: OrderItemAddon[] }>;
};

export type MockWhatsappStaffAction = "confirm" | "cancel";

function getMockActionSecret() {
  return process.env.WHATSAPP_MOCK_ACTION_SECRET ?? serverEnv.supabaseServiceRoleKey;
}

function signMockAction({
  restaurantId,
  orderId,
  orderNumber,
  action,
}: {
  restaurantId: string;
  orderId: string;
  orderNumber: string;
  action: MockWhatsappStaffAction;
}) {
  return createHmac("sha256", getMockActionSecret())
    .update(`${restaurantId}:${orderId}:${orderNumber}:${action}`)
    .digest("base64url");
}

function verifyMockActionToken({
  restaurantId,
  orderId,
  orderNumber,
  action,
  token,
}: {
  restaurantId: string;
  orderId: string;
  orderNumber: string;
  action: MockWhatsappStaffAction;
  token: string;
}) {
  const expected = signMockAction({
    restaurantId,
    orderId,
    orderNumber,
    action,
  });
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(token);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function buildMockActionUrl({
  restaurantSlug,
  orderNumber,
}: {
  restaurantSlug: string;
  orderNumber: string;
}) {
  return `/api/storefront/${restaurantSlug}/orders/${orderNumber}/mock-whatsapp-action`;
}

function formatMoney(currency: string, value: Prisma.Decimal | number) {
  return `${currency} ${Number(value).toLocaleString()}`;
}

function formatOrderMessage(order: OrderForMessage) {
  const lines = [
    `New Order: ${order.orderNumber}`,
    `Status: pending confirmation`,
    `Customer: ${order.customerNameSnapshot}`,
    `Phone: ${order.customerPhoneSnapshot}`,
    `Type: ${order.fulfillmentType}`,
    `Branch: ${order.branchNameSnapshot}`,
    order.addressTextSnapshot ? `Address: ${order.addressTextSnapshot}` : null,
    order.deliveryNotes ? `Notes: ${order.deliveryNotes}` : null,
    "",
    "Items:",
    ...order.items.map((item) => {
      const variant = item.variantNameSnapshot
        ? ` (${item.variantNameSnapshot})`
        : "";
      const addonLines = item.addons?.length
        ? `\n  Add-ons: ${item.addons
            .map((addon) => addon.addonNameSnapshot)
            .join(", ")}`
        : "";

      return `- ${item.quantity} x ${item.productNameSnapshot}${variant} - ${formatMoney(order.currency, item.lineTotal)}${addonLines}`;
    }),
    "",
    `Subtotal: ${formatMoney(order.currency, order.subtotal)}`,
    `Delivery fee: ${formatMoney(order.currency, order.deliveryFee)}`,
    `Total: ${formatMoney(order.currency, order.grandTotal)}`,
    "",
    "Action required: Confirm or Cancel this order.",
  ];

  return lines.filter(Boolean).join("\n");
}

export async function createMockWhatsappOrderLog({
  tx,
  order,
  restaurantId,
  branchId,
  restaurantSlug,
  connection,
}: {
  tx: Prisma.TransactionClient;
  order: OrderForMessage;
  restaurantId: string;
  branchId: string;
  restaurantSlug: string;
  connection: WhatsappConnection | null;
}) {
  const confirmToken = signMockAction({
    restaurantId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    action: "confirm",
  });
  const cancelToken = signMockAction({
    restaurantId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    action: "cancel",
  });
  const payload = {
    provider: connection?.provider ?? WhatsappProvider.MOCK,
    to: connection?.displayPhoneNumber ?? "mock-whatsapp-route",
    orderNumber: order.orderNumber,
    message: formatOrderMessage(order),
    interactiveActions: [
      {
        label: "Confirm",
        action: "confirm",
        token: confirmToken,
        endpoint: buildMockActionUrl({
          restaurantSlug,
          orderNumber: order.orderNumber,
        }),
      },
      {
        label: "Cancel",
        action: "cancel",
        token: cancelToken,
        endpoint: buildMockActionUrl({
          restaurantSlug,
          orderNumber: order.orderNumber,
        }),
      },
    ],
  };

  return tx.whatsappMessageLog.create({
    data: {
      restaurantId,
      branchId,
      orderId: order.id,
      whatsappConnectionId: connection?.id,
      direction: WhatsappMessageDirection.OUTBOUND,
      messageType: "new_order_staff_notification",
      payloadJson: payload,
      responseJson: {
        mode: "mock",
        note: "Use the mock action endpoint with the matching action and token to simulate branch staff confirmation or cancellation.",
      },
      status: WhatsappMessageStatus.SENT,
      sentAt: new Date(),
    },
  });
}

function renderCustomerNotification({
  order,
  action,
}: {
  order: Pick<
    Order,
    | "orderNumber"
    | "customerNameSnapshot"
    | "branchNameSnapshot"
    | "fulfillmentType"
    | "currency"
    | "grandTotal"
  >;
  action: MockWhatsappStaffAction;
}) {
  const orderType =
    order.fulfillmentType === FulfillmentType.DELIVERY ? "delivery" : "pickup";

  if (action === "confirm") {
    return [
      `Your order ${order.orderNumber} has been confirmed.`,
      `Branch: ${order.branchNameSnapshot}`,
      `Type: ${orderType}`,
      `Total: ${formatMoney(order.currency, order.grandTotal)}`,
      "Thank you. The restaurant will prepare it now.",
    ].join("\n");
  }

  return [
    `Your order ${order.orderNumber} has been cancelled by the restaurant.`,
    `Branch: ${order.branchNameSnapshot}`,
    "Please contact the restaurant if you need help placing another order.",
  ].join("\n");
}

export async function applyMockWhatsappStaffAction({
  restaurantSlug,
  orderNumber,
  action,
  token,
}: {
  restaurantSlug: string;
  orderNumber: string;
  action: MockWhatsappStaffAction;
  token: string;
}) {
  return runInTransaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        orderNumber,
        restaurant: {
          slug: restaurantSlug,
          isActive: true,
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
          },
        },
        whatsappConnection: true,
      },
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    const isValidToken = verifyMockActionToken({
      restaurantId: order.restaurantId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action,
      token,
    });

    if (!isValidToken) {
      throw new Error("Invalid or expired mock WhatsApp action token.");
    }

    const targetStatus =
      action === "confirm" ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
    const now = new Date();

    if (order.status !== OrderStatus.PENDING_CONFIRMATION) {
      const isSameFinalState = order.status === targetStatus;

      await tx.whatsappMessageLog.create({
        data: {
          restaurantId: order.restaurantId,
          branchId: order.branchId,
          orderId: order.id,
          whatsappConnectionId: order.whatsappConnectionId,
          direction: WhatsappMessageDirection.INBOUND,
          messageType: "mock_staff_order_action",
          payloadJson: {
            orderNumber: order.orderNumber,
            action,
            duplicate: true,
          },
          responseJson: {
            accepted: isSameFinalState,
            currentStatus: order.status,
          },
          status: isSameFinalState
            ? WhatsappMessageStatus.PROCESSED
            : WhatsappMessageStatus.FAILED,
          receivedAt: now,
          processedAt: now,
          errorMessage: isSameFinalState
            ? null
            : "Order is already in a different final state.",
        },
      });

      if (isSameFinalState) {
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          changed: false,
        };
      }

      throw new Error(
        `Order is already ${order.status.toLowerCase().replaceAll("_", " ")}.`,
      );
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: targetStatus,
        confirmedAt: action === "confirm" ? now : order.confirmedAt,
        cancelledAt: action === "cancel" ? now : order.cancelledAt,
        statusHistory: {
          create: {
            oldStatus: OrderStatus.PENDING_CONFIRMATION,
            newStatus: targetStatus,
            changeSource: OrderStatusChangeSource.WHATSAPP_STAFF_ACTION,
            notes: `Mock WhatsApp staff action: ${action}.`,
          },
        },
      },
    });

    await tx.whatsappMessageLog.create({
      data: {
        restaurantId: order.restaurantId,
        branchId: order.branchId,
        orderId: order.id,
        whatsappConnectionId: order.whatsappConnectionId,
        direction: WhatsappMessageDirection.INBOUND,
        messageType: "mock_staff_order_action",
        payloadJson: {
          orderNumber: order.orderNumber,
          action,
        },
        responseJson: {
          accepted: true,
          newStatus: targetStatus,
        },
        status: WhatsappMessageStatus.PROCESSED,
        receivedAt: now,
        processedAt: now,
      },
    });

    await tx.whatsappMessageLog.create({
      data: {
        restaurantId: order.restaurantId,
        branchId: order.branchId,
        orderId: order.id,
        whatsappConnectionId: order.whatsappConnectionId,
        direction: WhatsappMessageDirection.OUTBOUND,
        messageType:
          action === "confirm"
            ? "customer_order_confirmed_notification"
            : "customer_order_cancelled_notification",
        payloadJson: {
          provider: order.whatsappConnection?.provider ?? WhatsappProvider.MOCK,
          to: order.customerPhoneSnapshot,
          orderNumber: order.orderNumber,
          message: renderCustomerNotification({
            order,
            action,
          }),
        },
        responseJson: {
          mode: "mock",
          note: "Customer confirm/cancel notification contract. Real provider delivery is deferred to Phase 6.",
        },
        status: WhatsappMessageStatus.SENT,
        sentAt: now,
      },
    });

    return {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      changed: true,
    };
  });
}
