import { FulfillmentType, OrderStatus, Prisma } from "@prisma/client";
import { getPrisma } from "@/server/db/prisma";
import { formatOperatingHoursSummary, isWithinOperatingHours } from "@/lib/branch-hours";
import { verifyStorefrontOrderAccessToken } from "@/server/storefront/order-access";
import type {
  StorefrontBranch,
  StorefrontCategory,
  StorefrontData,
  StorefrontOrderSummary,
  StorefrontProduct,
  StorefrontRestaurant,
  StorefrontVariant,
} from "@/server/storefront/types";

const productInclude = {
  variants: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  },
  addonGroups: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      addons: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  },
  branchAvailability: {
    where: {
      isAvailable: true,
    },
    select: {
      branchId: true,
      deliveryAvailable: true,
      pickupAvailable: true,
    },
  },
} satisfies Prisma.ProductInclude;

function moneyToNumber(value: Prisma.Decimal | null | undefined) {
  return value ? Number(value) : null;
}

function variantPrice(
  basePrice: Prisma.Decimal,
  fixedPrice: Prisma.Decimal | null,
  priceDelta: Prisma.Decimal | null,
) {
  if (fixedPrice) {
    return Number(fixedPrice);
  }

  return Number(basePrice) + Number(priceDelta ?? 0);
}

function mapOrderStatus(status: OrderStatus) {
  if (status === OrderStatus.CONFIRMED) {
    return "confirmed";
  }

  if (status === OrderStatus.CANCELLED) {
    return "cancelled";
  }

  return "pending_confirmation";
}

function mapRestaurant(
  restaurant: Prisma.RestaurantGetPayload<{ include: { settings: true } }>,
): StorefrontRestaurant {
  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    logoUrl: restaurant.logoUrl,
    supportPhone: restaurant.supportPhone,
    contactEmail: restaurant.contactEmail,
    defaultCurrency: restaurant.defaultCurrency,
    timezone: restaurant.timezone,
    isAcceptingOrders: restaurant.settings?.isAcceptingOrders ?? true,
    isGloballyClosed: restaurant.settings?.isGloballyClosed ?? false,
    deliveryEnabled: restaurant.settings?.deliveryEnabled ?? true,
    pickupEnabled: restaurant.settings?.pickupEnabled ?? true,
    minimumOrderAmount: moneyToNumber(restaurant.settings?.minimumOrderAmount),
  };
}

function mapBranch(
  branch: Prisma.BranchGetPayload<{
    include: {
      deliveryZones: true;
      operatingHours: true;
    };
  }>,
  timezone: string,
): StorefrontBranch {
  const isOpenNow =
    branch.isAcceptingOrders &&
    !branch.isTemporarilyClosed &&
    isWithinOperatingHours(branch.operatingHours, timezone);
  const operatingHoursSummary = formatOperatingHoursSummary(branch.operatingHours);

  return {
    id: branch.id,
    name: branch.name,
    slug: branch.slug,
    phone: branch.phone,
    addressText: branch.addressText,
    latitude: moneyToNumber(branch.latitude),
    longitude: moneyToNumber(branch.longitude),
    supportsPickup: branch.isActive,
    supportsDelivery: branch.isActive && branch.deliveryZones.length > 0,
    deliveryRadiusKm: moneyToNumber(branch.deliveryZones[0]?.maxDistanceKm),
    operatingHoursSummary,
    isOpenNow,
    isAcceptingOrders: branch.isAcceptingOrders,
    isTemporarilyClosed: branch.isTemporarilyClosed,
    deliveryZones: branch.deliveryZones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      fee: Number(zone.fee),
      maxDistanceKm: moneyToNumber(zone.maxDistanceKm),
      minimumOrderAmount: moneyToNumber(zone.minimumOrderAmount),
    })),
  };
}

function mapProduct(
  product: Prisma.ProductGetPayload<{ include: typeof productInclude }>,
): StorefrontProduct {
  const variants: StorefrontVariant[] = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    price: variantPrice(
      product.basePrice,
      variant.fixedPrice,
      variant.priceDelta,
    ),
    isDefault: variant.isDefault,
  }));

  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    basePrice: Number(product.basePrice),
    deliveryAvailable: product.deliveryAvailable,
    pickupAvailable: product.pickupAvailable,
    variants,
    addonGroups: product.addonGroups.map((group) => ({
      id: group.id,
      name: group.name,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      isRequired: group.isRequired,
      addons: group.addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price),
      })),
    })),
    availableBranchIds: product.branchAvailability.map((item) => item.branchId),
  };
}

export async function getFallbackStorefrontSlug() {
  const restaurant = await getPrisma().restaurant.findFirst({
    where: { isActive: true },
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    select: { slug: true },
  });

  return restaurant?.slug ?? null;
}

export async function getStorefrontData(
  restaurantSlug: string,
): Promise<StorefrontData | null> {
  const prisma = getPrisma();

  const [restaurant, branches, categories] = await Promise.all([
    prisma.restaurant.findUnique({
      where: {
        slug: restaurantSlug,
        isActive: true,
      },
      include: {
        settings: true,
      },
    }),
    prisma.branch.findMany({
      where: {
        restaurant: {
          slug: restaurantSlug,
          isActive: true,
        },
        isActive: true,
      },
      include: {
        deliveryZones: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { fee: "asc" }],
        },
        operatingHours: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      where: {
        restaurant: {
          slug: restaurantSlug,
          isActive: true,
        },
        isActive: true,
      },
      include: {
        products: {
          where: {
            isActive: true,
            isAvailable: true,
          },
          include: productInclude,
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!restaurant) {
    return null;
  }

  return {
    restaurant: mapRestaurant(restaurant),
    branches: branches.map((branch) => mapBranch(branch, restaurant.timezone)),
    categories: categories
      .map<StorefrontCategory>((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        products: category.products.map(mapProduct),
      }))
      .filter((category) => category.products.length > 0),
  };
}

export async function getStorefrontOrderSummary({
  restaurantSlug,
  orderNumber,
  accessToken,
}: {
  restaurantSlug: string;
  orderNumber: string;
  accessToken?: string | null;
}): Promise<StorefrontOrderSummary | null> {
  const order = await getPrisma().order.findFirst({
    where: {
      orderNumber,
      restaurant: {
        slug: restaurantSlug,
      },
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  if (
    !verifyStorefrontOrderAccessToken({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerPhone: order.customerPhoneSnapshot,
      token: accessToken,
    })
  ) {
    return null;
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    accessToken: accessToken ?? "",
    status: mapOrderStatus(order.status),
    branchName: order.branchNameSnapshot,
    fulfillmentType:
      order.fulfillmentType === FulfillmentType.DELIVERY
        ? "delivery"
        : "pickup",
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    grandTotal: Number(order.grandTotal),
    currency: order.currency,
    placedAt: order.placedAt.toISOString(),
    customerName: order.customerNameSnapshot,
    customerPhone: order.customerPhoneSnapshot,
    addressText: order.addressTextSnapshot,
    items: order.items.map((item) => ({
      name: item.productNameSnapshot,
      variantName: item.variantNameSnapshot,
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
  };
}
