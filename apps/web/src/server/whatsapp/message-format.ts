import {
  FulfillmentType,
  type Order,
  type OrderItem,
  type OrderItemAddon,
  type Prisma,
} from "@prisma/client";

export type OrderForWhatsappMessage = Order & {
  items: Array<OrderItem & { addons?: OrderItemAddon[] }>;
};

export function formatWhatsappMoney(
  currency: string,
  value: Prisma.Decimal | number,
) {
  return `${currency} ${Number(value).toLocaleString()}`;
}

export function formatStaffOrderMessage(order: OrderForWhatsappMessage) {
  const lines = [
    `New NapCart Order: ${order.orderNumber}`,
    "Status: pending confirmation",
    `Customer: ${order.customerNameSnapshot}`,
    `Phone: ${order.customerPhoneSnapshot}`,
    `Type: ${order.fulfillmentType === FulfillmentType.DELIVERY ? "Delivery" : "Pickup"}`,
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

      return `- ${item.quantity} x ${item.productNameSnapshot}${variant} - ${formatWhatsappMoney(order.currency, item.lineTotal)}${addonLines}`;
    }),
    "",
    `Subtotal: ${formatWhatsappMoney(order.currency, order.subtotal)}`,
    `Delivery fee: ${formatWhatsappMoney(order.currency, order.deliveryFee)}`,
    `Total: ${formatWhatsappMoney(order.currency, order.grandTotal)}`,
    "",
    "Action required: Confirm or Cancel this order.",
  ];

  return lines.filter(Boolean).join("\n");
}
