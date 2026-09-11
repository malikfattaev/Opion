import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { serverEnv } from "@/lib/env";

/**
 * В dev-режиме Next.js перезагружает модули на каждое изменение файла.
 * Без кеша в globalThis это порождало бы новый пул соединений на каждый hot reload.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const { DATABASE_URL, NODE_ENV } = serverEnv();

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
    log: NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (serverEnv().NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
