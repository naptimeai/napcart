import { DayOfWeek, OrderStatus, Prisma } from "@prisma/client";
import { DAY_ORDER } from "@/lib/constants/admin";
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

export async function getAdminDashboardData(restaurantId: string) {
  const prisma = getPrisma();

  const [
    restaurant,
    branches,
    connections,
    pendingConfirmationOrdersCount,
    confirmedOrdersCount,
    cancelledOrdersCount,
    customersCount,
    productsCount,
  ] = await prisma.$transaction([
    prisma.restaurant.findUniqueOrThrow({
      where: { id: restaurantId },
      include: {
        settings: true,
      },
    }),
    prisma.branch.findMany({
      where: { restaurantId },
      include: branchInclude,
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.whatsappConnection.findMany({
      where: { restaurantId },
      orderBy: [{ isDefaultForRestaurant: "desc" }, { createdAt: "asc" }],
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: OrderStatus.PENDING_CONFIRMATION,
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: OrderStatus.CONFIRMED,
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: OrderStatus.CANCELLED,
      },
    }),
    prisma.customer.count({
      where: { restaurantId },
    }),
    prisma.product.count({
      where: { restaurantId, isActive: true },
    }),
  ]);

  return {
    restaurant,
    branches,
    connections,
    metrics: {
      branchesCount: branches.length,
      customersCount,
      productsCount,
      pendingConfirmationOrdersCount,
      confirmedOrdersCount,
      cancelledOrdersCount,
      activeConnectionsCount: connections.filter((item) => item.isActive).length,
      acceptingBranchesCount: branches.filter((item) => item.isAcceptingOrders).length,
    },
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
