import {
  DayOfWeek,
  FulfillmentType,
  OrderStatus,
  Prisma,
} from "@prisma/client";
import { DAY_ORDER } from "@/lib/constants/admin";
import type { DashboardDateRange } from "@/lib/admin-dashboard-date-range";
import { getPrisma } from "@/server/db/prisma";

const branchInclude = {
  operatingHours: true,
  deliveryZones: true,
  whatsappConnections: {
    select: {
      id: true,
      businessName: true,
      displayPhoneNumber: true,
      isActive: true,
      isDefaultForRestaurant: true,
      branchId: true,
      provider: true,
    },
  },
} satisfies Prisma.BranchInclude;

export async function getAdminDashboardData(
  restaurantId: string,
  dateRange?: DashboardDateRange,
) {
  const prisma = getPrisma();
  const orderDateFilter = dateRange
    ? {
        placedAt: {
          gte: dateRange.fromDate,
          lt: dateRange.toDateExclusive,
        },
      }
    : {};
  const customerDateFilter = dateRange
    ? {
        createdAt: {
          gte: dateRange.fromDate,
          lt: dateRange.toDateExclusive,
        },
      }
    : {};

  const [
    restaurant,
    branchesCount,
    acceptingBranchesCount,
    activeConnectionsCount,
    totalOrdersCount,
    pendingConfirmationOrdersCount,
    confirmedOrdersCount,
    cancelledOrdersCount,
    newCustomersCount,
    confirmedRevenue,
    productsCount,
    recentOrders,
    recentCustomers,
  ] = await Promise.all([
    prisma.restaurant.findUniqueOrThrow({
      where: { id: restaurantId },
      select: {
        defaultCurrency: true,
      },
    }),
    prisma.branch.count({
      where: { restaurantId },
    }),
    prisma.branch.count({
      where: { restaurantId, isAcceptingOrders: true },
    }),
    prisma.whatsappConnection.count({
      where: { restaurantId, isActive: true },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        ...orderDateFilter,
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: OrderStatus.PENDING_CONFIRMATION,
        ...orderDateFilter,
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: OrderStatus.CONFIRMED,
        ...orderDateFilter,
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: OrderStatus.CANCELLED,
        ...orderDateFilter,
      },
    }),
    prisma.customer.count({
      where: { restaurantId, ...customerDateFilter },
    }),
    prisma.order.aggregate({
      where: {
        restaurantId,
        status: OrderStatus.CONFIRMED,
        ...orderDateFilter,
      },
      _sum: {
        grandTotal: true,
      },
    }),
    prisma.product.count({
      where: { restaurantId, isActive: true },
    }),
    prisma.order.findMany({
      where: {
        restaurantId,
        ...orderDateFilter,
      },
      select: {
        id: true,
        placedAt: true,
        status: true,
        grandTotal: true,
      },
      orderBy: { placedAt: "asc" },
    }),
    prisma.customer.findMany({
      where: { restaurantId, ...customerDateFilter },
      take: 25,
      orderBy: [{ lastOrderAt: "desc" }, { createdAt: "desc" }],
      include: {
        addresses: {
          take: 1,
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        orders: {
          take: 1,
          orderBy: { placedAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            grandTotal: true,
            placedAt: true,
            branchNameSnapshot: true,
          },
        },
      },
    }),
  ]);

  return {
    restaurant,
    metrics: {
      totalRevenue: Number(confirmedRevenue._sum.grandTotal ?? 0),
      totalOrdersCount,
      newCustomersCount,
      branchesCount,
      productsCount,
      pendingConfirmationOrdersCount,
      confirmedOrdersCount,
      cancelledOrdersCount,
      activeConnectionsCount,
      acceptingBranchesCount,
    },
    recentOrders,
    recentCustomers,
  };
}

export async function getRestaurantSettingsData(restaurantId: string) {
  return getPrisma().restaurant.findUniqueOrThrow({
    where: { id: restaurantId },
    include: {
      settings: true,
    },
  });
}

export async function getBranchManagementData(restaurantId: string) {
  const branches = await getPrisma().branch.findMany({
    where: { restaurantId },
    include: branchInclude,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return branches.map((branch) => ({
    ...branch,
    operatingHours: DAY_ORDER.map((day) => {
      const hour = branch.operatingHours.find((item) => item.dayOfWeek === day);

      return (
        hour ?? {
          id: `missing-${branch.id}-${day}`,
          branchId: branch.id,
          dayOfWeek: day as DayOfWeek,
          openTime: "11:00",
          closeTime: "23:00",
          isClosed: false,
          createdAt: new Date(0),
          updatedAt: new Date(0),
        }
      );
    }),
  }));
}

export async function getWhatsappSettingsData(restaurantId: string) {
  const prisma = getPrisma();
  const [connections, branches] = await prisma.$transaction([
    prisma.whatsappConnection.findMany({
      where: { restaurantId },
      orderBy: [{ isDefaultForRestaurant: "desc" }, { createdAt: "asc" }],
    }),
    prisma.branch.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    connections,
    branches,
  };
}

export async function getAdminSearchIndex(restaurantId: string) {
  return getPrisma().branch.findMany({
    where: { restaurantId },
    select: {
      id: true,
      name: true,
      isActive: true,
      isAcceptingOrders: true,
      isTemporarilyClosed: true,
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCustomerDirectoryData(restaurantId: string) {
  const prisma = getPrisma();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);

  const [
    restaurant,
    totalCustomersCount,
    returningCustomersCount,
    newTodayCount,
    newLast30DaysCount,
    customers,
  ] = await prisma.$transaction([
    prisma.restaurant.findUniqueOrThrow({
      where: { id: restaurantId },
      select: {
        id: true,
        defaultCurrency: true,
        name: true,
        timezone: true,
      },
    }),
    prisma.customer.count({
      where: { restaurantId },
    }),
    prisma.customer.count({
      where: {
        restaurantId,
        totalOrdersCount: { gt: 1 },
      },
    }),
    prisma.customer.count({
      where: {
        restaurantId,
        createdAt: { gte: startOfToday },
      },
    }),
    prisma.customer.count({
      where: {
        restaurantId,
        createdAt: { gte: startOfLast30Days },
      },
    }),
    prisma.customer.findMany({
      where: { restaurantId },
      orderBy: [{ lastOrderAt: "desc" }, { createdAt: "desc" }],
      include: {
        addresses: {
          take: 1,
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        orders: {
          take: 1,
          orderBy: { placedAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            grandTotal: true,
            placedAt: true,
            branchNameSnapshot: true,
          },
        },
      },
    }),
  ]);

  return {
    restaurant,
    metrics: {
      totalCustomersCount,
      returningCustomersCount,
      newTodayCount,
      newLast30DaysCount,
    },
    customers,
  };
}

export type AdminOrdersFilters = {
  q?: string;
  status?: OrderStatus | "all";
  branchId?: string;
  fulfillmentType?: FulfillmentType | "all";
  page?: number;
  pageSize?: number;
};

function buildAdminOrdersWhere(
  restaurantId: string,
  filters: AdminOrdersFilters = {},
): Prisma.OrderWhereInput {
  const query = filters.q?.trim();
  const and: Prisma.OrderWhereInput[] = [{ restaurantId }];

  if (query) {
    and.push({
      OR: [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { customerNameSnapshot: { contains: query, mode: "insensitive" } },
        { customerPhoneSnapshot: { contains: query, mode: "insensitive" } },
        { branchNameSnapshot: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  if (filters.status && filters.status !== "all") {
    and.push({ status: filters.status });
  }

  if (filters.branchId) {
    and.push({ branchId: filters.branchId });
  }

  if (filters.fulfillmentType && filters.fulfillmentType !== "all") {
    and.push({ fulfillmentType: filters.fulfillmentType });
  }

  return { AND: and };
}

export async function getAdminOrdersData(
  restaurantId: string,
  filters: AdminOrdersFilters = {},
) {
  const prisma = getPrisma();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 50);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const where = buildAdminOrdersWhere(restaurantId, filters);

  const [
    restaurant,
    branches,
    totalOrdersCount,
    pendingConfirmationOrdersCount,
    confirmedOrdersCount,
    cancelledOrdersCount,
    confirmedRevenue,
    filteredOrdersCount,
    orders,
  ] = await prisma.$transaction([
    prisma.restaurant.findUniqueOrThrow({
      where: { id: restaurantId },
      select: {
        id: true,
        defaultCurrency: true,
        name: true,
        slug: true,
      },
    }),
    prisma.branch.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        isActive: true,
        isAcceptingOrders: true,
        isTemporarilyClosed: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.order.count({
      where: { restaurantId },
    }),
    prisma.order.count({
      where: { restaurantId, status: OrderStatus.PENDING_CONFIRMATION },
    }),
    prisma.order.count({
      where: { restaurantId, status: OrderStatus.CONFIRMED },
    }),
    prisma.order.count({
      where: { restaurantId, status: OrderStatus.CANCELLED },
    }),
    prisma.order.aggregate({
      where: { restaurantId, status: OrderStatus.CONFIRMED },
      _sum: {
        grandTotal: true,
      },
    }),
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        orderNumber: true,
        status: true,
        fulfillmentType: true,
        paymentMethod: true,
        paymentStatus: true,
        customerNameSnapshot: true,
        customerPhoneSnapshot: true,
        branchNameSnapshot: true,
        grandTotal: true,
        currency: true,
        placedAt: true,
        confirmedAt: true,
        cancelledAt: true,
        whatsappMessageLogs: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            direction: true,
            messageType: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            items: true,
            whatsappMessageLogs: true,
          },
        },
      },
    }),
  ]);

  return {
    restaurant,
    branches,
    filters: {
      ...filters,
      page,
      pageSize,
    },
    metrics: {
      totalOrdersCount,
      pendingConfirmationOrdersCount,
      confirmedOrdersCount,
      cancelledOrdersCount,
      confirmedRevenue: Number(confirmedRevenue._sum.grandTotal ?? 0),
      filteredOrdersCount,
    },
    orders,
    pagination: {
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(filteredOrdersCount / pageSize), 1),
      totalRecords: filteredOrdersCount,
      startRecord: filteredOrdersCount === 0 ? 0 : skip + 1,
      endRecord: Math.min(skip + pageSize, filteredOrdersCount),
    },
  };
}

export async function getAdminOrderDetailData(
  restaurantId: string,
  orderNumber: string,
) {
  return getPrisma().order.findFirst({
    where: {
      restaurantId,
      orderNumber,
    },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          slug: true,
          addressText: true,
          isActive: true,
          isAcceptingOrders: true,
          isTemporarilyClosed: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          normalizedPhone: true,
          rawPhoneInput: true,
          email: true,
          totalOrdersCount: true,
          firstOrderAt: true,
          lastOrderAt: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          addons: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      statusHistory: {
        orderBy: { changedAt: "asc" },
        include: {
          changedByAdminUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      whatsappConnection: {
        select: {
          id: true,
          provider: true,
          businessName: true,
          whatsappBusinessAccountId: true,
          phoneNumberId: true,
          displayPhoneNumber: true,
          isActive: true,
          isDefaultForRestaurant: true,
          branchId: true,
        },
      },
      whatsappMessageLogs: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          direction: true,
          messageType: true,
          providerMessageId: true,
          templateName: true,
          payloadJson: true,
          responseJson: true,
          status: true,
          errorMessage: true,
          sentAt: true,
          receivedAt: true,
          processedAt: true,
          createdAt: true,
          updatedAt: true,
          whatsappConnection: {
            select: {
              id: true,
              provider: true,
              businessName: true,
              displayPhoneNumber: true,
            },
          },
        },
      },
    },
  });
}

export async function getCatalogManagementData(restaurantId: string) {
  const prisma = getPrisma();
  const [restaurant, categories, products, branches] = await Promise.all([
    prisma.restaurant.findUniqueOrThrow({
      where: { id: restaurantId },
      select: {
        id: true,
        defaultCurrency: true,
        defaultLanguage: true,
        name: true,
        slug: true,
        timezone: true,
        settings: true,
      },
    }),
    prisma.category.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { restaurantId },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        addonGroups: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            addons: {
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            },
          },
        },
        branchAvailability: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.branch.findMany({
      where: { restaurantId, isActive: true },
      select: {
        id: true,
        name: true,
        isAcceptingOrders: true,
        isTemporarilyClosed: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    restaurant,
    categories,
    products,
    branches,
  };
}

export async function getDeliveryZoneManagementData(restaurantId: string) {
  const prisma = getPrisma();
  const [restaurant, branches] = await Promise.all([
    prisma.restaurant.findUniqueOrThrow({
      where: { id: restaurantId },
      select: {
        id: true,
        defaultCurrency: true,
        name: true,
        timezone: true,
      },
    }),
    prisma.branch.findMany({
      where: { restaurantId },
      include: {
        deliveryZones: {
          orderBy: [{ sortOrder: "asc" }, { maxDistanceKm: "asc" }],
        },
        operatingHours: true,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    restaurant,
    branches,
  };
}
