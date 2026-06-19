import {
  FulfillmentType,
  OrderStatus,
  OrderStatusChangeSource,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { z } from "zod";
import { runInTransaction } from "@/server/db/transaction";
import { isWithinOperatingHours } from "@/lib/branch-hours";
import { resolveSelectedAddons } from "@/server/storefront/addon-validation";
import { normalizePakistanPhone } from "@/server/storefront/phone";
import { signStorefrontOrderAccessToken } from "@/server/storefront/order-access";
import type {
  StorefrontOrderRequest,
  StorefrontOrderResponse,
} from "@/server/storefront/types";
import { createWhatsappOrderNotificationLog } from "@/server/whatsapp/order-notifications";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(25),
  addonIds: z.array(z.string().uuid()).optional().default([]),
  itemNotes: z.string().trim().max(500).optional(),
});

export const storefrontOrderSchema = z.object({
  branchId: z.string().uuid(),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(30),
  }),
  addressText: z.string().trim().max(700).optional(),
  deliveryZoneId: z.string().uuid().optional(),
  deliveryNotes: z.string().trim().max(500).optional(),
  orderNotes: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1).max(40),
});

function toMoney(value: number | string) {
  return new Prisma.Decimal(String(value));
}

function resolveVariantPrice({
  basePrice,
  fixedPrice,
  priceDelta,
}: {
  basePrice: Prisma.Decimal;
  fixedPrice: Prisma.Decimal | null;
  priceDelta: Prisma.Decimal | null;
}) {
  if (fixedPrice) {
    return Number(fixedPrice);
  }

  return Number(basePrice) + Number(priceDelta ?? 0);
}

function makeOrderNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/\D/g, "").slice(2, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `NC-${stamp}-${suffix}`;
}

async function resolveWhatsappConnection(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  branchId: string,
) {
  return (
    (await tx.whatsappConnection.findFirst({
      where: {
        restaurantId,
        branchId,
        isActive: true,
      },
      orderBy: [{ createdAt: "asc" }],
    })) ??
    (await tx.whatsappConnection.findFirst({
      where: {
        restaurantId,
        isDefaultForRestaurant: true,
        isActive: true,
      },
      orderBy: [{ createdAt: "asc" }],
    })) ??
    (await tx.whatsappConnection.findFirst({
      where: {
        restaurantId,
        isActive: true,
      },
      orderBy: [{ createdAt: "asc" }],
    }))
  );
}

export async function placeStorefrontOrder(
  restaurantSlug: string,
  input: StorefrontOrderRequest,
): Promise<StorefrontOrderResponse> {
  const request = storefrontOrderSchema.parse(input);
  const normalizedPhone = normalizePakistanPhone(request.customer.phone);

  return runInTransaction(async (tx) => {
    const restaurant = await tx.restaurant.findUnique({
      where: {
        slug: restaurantSlug,
        isActive: true,
      },
      include: {
        settings: true,
      },
    });

    if (!restaurant) {
      throw new Error("Restaurant storefront is unavailable.");
    }

    if (
      restaurant.settings?.isGloballyClosed ||
      restaurant.settings?.isAcceptingOrders === false
    ) {
      throw new Error("This restaurant is not accepting orders right now.");
    }

    if (
      request.fulfillmentType === "delivery" &&
      restaurant.settings?.deliveryEnabled === false
    ) {
      throw new Error("Delivery is currently unavailable.");
    }

    if (
      request.fulfillmentType === "pickup" &&
      restaurant.settings?.pickupEnabled === false
    ) {
      throw new Error("Pickup is currently unavailable.");
    }

    if (request.fulfillmentType === "delivery" && !request.addressText) {
      throw new Error("Delivery address is required.");
    }

    const branch = await tx.branch.findFirst({
      where: {
        id: request.branchId,
        restaurantId: restaurant.id,
        isActive: true,
      },
      include: {
        deliveryZones: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { fee: "asc" }],
        },
        operatingHours: true,
      },
    });

    if (!branch) {
      throw new Error("Selected branch is unavailable.");
    }

    if (!branch.isAcceptingOrders || branch.isTemporarilyClosed) {
      throw new Error("Selected branch is not accepting orders right now.");
    }

    if (!isWithinOperatingHours(branch.operatingHours, restaurant.timezone)) {
      throw new Error("Selected branch is closed right now.");
    }

    const productIds = [
      ...new Set(request.items.map((item) => item.productId)),
    ];
    const products = await tx.product.findMany({
      where: {
        restaurantId: restaurant.id,
        id: { in: productIds },
        isActive: true,
        isAvailable: true,
      },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        addonGroups: {
          where: { isActive: true },
          include: {
            addons: {
              where: { isActive: true },
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            },
          },
        },
        branchAvailability: {
          where: {
            branchId: branch.id,
          },
        },
      },
    });
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderItems = request.items.map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        throw new Error("One or more cart items are unavailable.");
      }

      const branchAvailability = product.branchAvailability[0];
      if (
        !branchAvailability?.isAvailable ||
        (request.fulfillmentType === "delivery" &&
          !branchAvailability.deliveryAvailable) ||
        (request.fulfillmentType === "pickup" &&
          !branchAvailability.pickupAvailable)
      ) {
        throw new Error(`${product.name} is unavailable for this branch.`);
      }

      if (
        request.fulfillmentType === "delivery" &&
        !product.deliveryAvailable
      ) {
        throw new Error(`${product.name} is unavailable for delivery.`);
      }

      if (request.fulfillmentType === "pickup" && !product.pickupAvailable) {
        throw new Error(`${product.name} is unavailable for pickup.`);
      }

      const selectedVariant =
        (item.variantId
          ? product.variants.find((variant) => variant.id === item.variantId)
          : product.variants.find((variant) => variant.isDefault)) ??
        product.variants[0];

      if (!selectedVariant) {
        throw new Error(`${product.name} has no available variant.`);
      }

      const addonIds = item.addonIds ?? [];
      const selectedAddons = resolveSelectedAddons({
        addonGroups: product.addonGroups,
        addonIds,
        productName: product.name,
      });

      const addonTotal = selectedAddons.reduce(
        (sum, match) => sum + Number(match.addon.price),
        0,
      );
      const unitPrice =
        resolveVariantPrice({
          basePrice: product.basePrice,
          fixedPrice: selectedVariant.fixedPrice,
          priceDelta: selectedVariant.priceDelta,
        }) + addonTotal;
      const lineTotal = unitPrice * item.quantity;

      return {
        product,
        variant: selectedVariant,
        selectedAddons,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        itemNotes: item.itemNotes,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryZone =
      request.fulfillmentType === "delivery"
        ? (request.deliveryZoneId
            ? branch.deliveryZones.find(
                (zone) => zone.id === request.deliveryZoneId,
              )
            : branch.deliveryZones[0])
        : null;

    if (request.fulfillmentType === "delivery" && !deliveryZone) {
      throw new Error("Selected branch has no active delivery zone.");
    }

    const deliveryFee = deliveryZone ? Number(deliveryZone.fee) : 0;
    const grandTotal = subtotal + deliveryFee;
    const minimumOrderAmount =
      Number(
        deliveryZone?.minimumOrderAmount ??
          restaurant.settings?.minimumOrderAmount ??
          0,
      ) || 0;

    if (minimumOrderAmount > 0 && grandTotal < minimumOrderAmount) {
      throw new Error(
        `Minimum order amount is ${restaurant.defaultCurrency} ${minimumOrderAmount.toLocaleString()}.`,
      );
    }

    const existingCustomer = await tx.customer.findUnique({
      where: {
        restaurantId_normalizedPhone: {
          restaurantId: restaurant.id,
          normalizedPhone,
        },
      },
    });

    const now = new Date();
    const customer = existingCustomer
      ? await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: request.customer.name,
            rawPhoneInput: request.customer.phone,
            totalOrdersCount: { increment: 1 },
            lastOrderAt: now,
          },
        })
      : await tx.customer.create({
          data: {
            restaurantId: restaurant.id,
            name: request.customer.name,
            normalizedPhone,
            rawPhoneInput: request.customer.phone,
            totalOrdersCount: 1,
            firstOrderAt: now,
            lastOrderAt: now,
          },
        });

    if (request.fulfillmentType === "delivery" && request.addressText) {
      await tx.customerAddress.create({
        data: {
          customerId: customer.id,
          label: "Delivery",
          addressText: request.addressText,
          deliveryNotes: request.deliveryNotes ?? request.orderNotes,
          isDefault: true,
        },
      });
    }

    const whatsappConnection = await resolveWhatsappConnection(
      tx,
      restaurant.id,
      branch.id,
    );
    const paymentMethod =
      request.fulfillmentType === "delivery"
        ? PaymentMethod.CASH_ON_DELIVERY
        : PaymentMethod.CASH_ON_PICKUP;

    const order = await tx.order.create({
      data: {
        restaurantId: restaurant.id,
        branchId: branch.id,
        customerId: customer.id,
        whatsappConnectionId: whatsappConnection?.id,
        orderNumber: makeOrderNumber(),
        status: OrderStatus.PENDING_CONFIRMATION,
        fulfillmentType:
          request.fulfillmentType === "delivery"
            ? FulfillmentType.DELIVERY
            : FulfillmentType.PICKUP,
        paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        customerNameSnapshot: request.customer.name,
        customerPhoneSnapshot: normalizedPhone,
        addressTextSnapshot:
          request.fulfillmentType === "delivery" ? request.addressText : null,
        deliveryNotes: request.deliveryNotes ?? request.orderNotes,
        branchNameSnapshot: branch.name,
        subtotal: toMoney(subtotal),
        deliveryFee: toMoney(deliveryFee),
        discountTotal: toMoney(0),
        taxTotal: toMoney(0),
        grandTotal: toMoney(grandTotal),
        currency: restaurant.defaultCurrency,
        confirmedAt: null,
        placedAt: now,
        items: {
          create: orderItems.map((item) => ({
            productId: item.product.id,
            productNameSnapshot: item.product.name,
            variantNameSnapshot: item.variant.name,
            unitPrice: toMoney(item.unitPrice),
            quantity: item.quantity,
            lineTotal: toMoney(item.lineTotal),
            itemNotes: item.itemNotes,
            addons: {
              create: item.selectedAddons.map(({ addon }) => ({
                addonNameSnapshot: addon.name,
                addonPriceSnapshot: addon.price,
                quantity: item.quantity,
                lineTotal: toMoney(Number(addon.price) * item.quantity),
              })),
            },
          })),
        },
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: OrderStatus.PENDING_CONFIRMATION,
            changeSource: OrderStatusChangeSource.SYSTEM,
            notes:
              "Order placed from storefront guest checkout and sent for branch confirmation.",
          },
        },
      },
      include: {
        items: {
          include: {
            addons: true,
          },
        },
      },
    });

    await createWhatsappOrderNotificationLog({
      tx,
      order,
      restaurantId: restaurant.id,
      branchId: branch.id,
      restaurantSlug: restaurant.slug,
      connection: whatsappConnection,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      accessToken: signStorefrontOrderAccessToken({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: order.customerPhoneSnapshot,
      }),
      status: "pending_confirmation",
      branchName: branch.name,
      fulfillmentType: request.fulfillmentType,
      subtotal,
      deliveryFee,
      grandTotal,
      currency: restaurant.defaultCurrency,
      placedAt: order.placedAt.toISOString(),
    };
  });
}
