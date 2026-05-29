import { OrderStatus } from "@prisma/client";
import { getPrisma } from "@/server/db/prisma";

export async function findAdminUserByAuthUserId(authUserId: string) {
  return getPrisma().adminUser.findUnique({
    where: { authUserId },
    include: {
      restaurant: {
        include: {
          settings: true,
        },
      },
    },
  });
}

export async function getAdminDashboardSummary(restaurantId: string) {
  const prisma = getPrisma();

  const [
    branchesCount,
    categoriesCount,
    productsCount,
    customersCount,
    pendingConfirmationOrdersCount,
    confirmedOrdersCount,
    cancelledOrdersCount,
  ] = await prisma.$transaction([
    prisma.branch.count({ where: { restaurantId, isActive: true } }),
    prisma.category.count({ where: { restaurantId, isActive: true } }),
    prisma.product.count({ where: { restaurantId, isActive: true } }),
    prisma.customer.count({ where: { restaurantId } }),
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
  ]);

  return {
    branchesCount,
    categoriesCount,
    productsCount,
    customersCount,
    pendingConfirmationOrdersCount,
    confirmedOrdersCount,
    cancelledOrdersCount,
  };
}
