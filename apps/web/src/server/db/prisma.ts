import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { serverEnv } from "@/lib/config/server-env";

type GlobalWithPrisma = typeof globalThis & {
  __napcartPrisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: serverEnv.databaseUrl,
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  const globalForPrisma = globalThis as GlobalWithPrisma;

  if (!globalForPrisma.__napcartPrisma) {
    globalForPrisma.__napcartPrisma = createPrismaClient();
  }

  return globalForPrisma.__napcartPrisma;
}
