import { Prisma } from "@prisma/client";
import { getPrisma } from "@/server/db/prisma";

export async function runInTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: Parameters<ReturnType<typeof getPrisma>["$transaction"]>[1],
) {
  return getPrisma().$transaction(operation, options);
}
