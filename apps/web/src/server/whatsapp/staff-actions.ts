import {
  FulfillmentType,
  OrderStatus,
  OrderStatusChangeSource,
  WhatsappMessageDirection,
  WhatsappMessageStatus,
  WhatsappProvider,
  type Order,
  type Prisma,
} from "@prisma/client";
import { runInTransaction } from "@/server/db/transaction";

export type WhatsappStaffAction = "confirm" | "cancel";

type ApplyWhatsappStaffActionInput =
  | {
      action: WhatsappStaffAction;
      inboundPayload: Prisma.InputJsonValue;
      messageType: string;
      provider: WhatsappProvider;
      providerMessageId?: string | null;
      restaurantId?: never;
      restaurantSlug: string;
      orderId?: never;
      orderNumber: string;
      responseContext?: Prisma.InputJsonObject;
    }
  | {
      action: WhatsappStaffAction;
      inboundPayload: Prisma.InputJsonValue;
      messageType: string;
      provider: WhatsappProvider;
      providerMessageId?: string | null;
      restaurantId: string;
      restaurantSlug?: never;
      orderId: string;
      orderNumber?: never;
      responseContext?: Prisma.InputJsonObject;
    };

function formatMoney(currency: string, value: Prisma.Decimal | number) {
  return `${currency} ${Number(value).toLocaleString()}`;
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
  action: WhatsappStaffAction;
}) {
  const orderType =
    order.fulfillmentType === FulfillmentType.DELIVERY ? "delivery" : "pickup";

  if (action === "confirm") {
    return [
      `Your NapCart order ${order.orderNumber} has been confirmed.`,
      `Branch: ${order.branchNameSnapshot}`,
      `Type: ${orderType}`,
      `Total: ${formatMoney(order.currency, order.grandTotal)}`,
      "Thank you. The restaurant will prepare it now.",
    ].join("\n");
  }

  return [
    `Your NapCart order ${order.orderNumber} has been cancelled by the restaurant.`,
    `Branch: ${order.branchNameSnapshot}`,
    "Please contact the restaurant if you need help placing another order.",
  ].join("\n");
}

function getTargetStatus(action: WhatsappStaffAction) {
  return action === "confirm" ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
}

function getCustomerMessageType(action: WhatsappStaffAction) {
  return action === "confirm"
    ? "customer_order_confirmed_notification"
    : "customer_order_cancelled_notification";
}

export async function applyWhatsappStaffAction(
  input: ApplyWhatsappStaffActionInput,
) {
  return runInTransaction(async (tx) => {
    const order = input.orderId
      ? await tx.order.findFirst({
          where: {
            id: input.orderId,
            restaurantId: input.restaurantId,
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
        })
      : await tx.order.findFirst({
          where: {
            orderNumber: input.orderNumber,
            restaurant: {
              slug: input.restaurantSlug,
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

    const targetStatus = getTargetStatus(input.action);
    const now = new Date();
    const responseContext = input.responseContext ?? {};

    if (order.status !== OrderStatus.PENDING_CONFIRMATION) {
      const isSameFinalState = order.status === targetStatus;

      await tx.whatsappMessageLog.create({
        data: {
          restaurantId: order.restaurantId,
          branchId: order.branchId,
          orderId: order.id,
          whatsappConnectionId: order.whatsappConnectionId,
          direction: WhatsappMessageDirection.INBOUND,
          messageType: input.messageType,
          providerMessageId: input.providerMessageId ?? null,
          payloadJson: {
            action: input.action,
            duplicate: true,
            orderNumber: order.orderNumber,
            provider: input.provider,
            webhookPayload: input.inboundPayload,
          },
          responseJson: {
            accepted: isSameFinalState,
            currentStatus: order.status,
            ...responseContext,
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
          changed: false,
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
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
        confirmedAt: input.action === "confirm" ? now : order.confirmedAt,
        cancelledAt: input.action === "cancel" ? now : order.cancelledAt,
        statusHistory: {
          create: {
            oldStatus: OrderStatus.PENDING_CONFIRMATION,
            newStatus: targetStatus,
            changeSource: OrderStatusChangeSource.WHATSAPP_STAFF_ACTION,
            notes: `${input.provider} WhatsApp staff action: ${input.action}.`,
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
        messageType: input.messageType,
        providerMessageId: input.providerMessageId ?? null,
        payloadJson: {
          action: input.action,
          orderNumber: order.orderNumber,
          provider: input.provider,
          webhookPayload: input.inboundPayload,
        },
        responseJson: {
          accepted: true,
          newStatus: targetStatus,
          ...responseContext,
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
        messageType: getCustomerMessageType(input.action),
        payloadJson: {
          provider: order.whatsappConnection?.provider ?? input.provider,
          to: order.customerPhoneSnapshot,
          orderNumber: order.orderNumber,
          message: renderCustomerNotification({
            order,
            action: input.action,
          }),
        },
        responseJson: {
          mode:
            input.provider === WhatsappProvider.META_CLOUD
              ? "meta_cloud_phase6a"
              : "mock",
          note:
            input.provider === WhatsappProvider.META_CLOUD
              ? "Customer confirm/cancel notification contract prepared. Live sending is deferred until Meta credentials are enabled."
              : "Customer confirm/cancel notification contract.",
        },
        status: WhatsappMessageStatus.SENT,
        sentAt: now,
      },
    });

    return {
      changed: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
    };
  });
}
