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
