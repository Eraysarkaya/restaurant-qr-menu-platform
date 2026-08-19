import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { assertRuntimeEnv } from "@/server/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const runtimeEnv = assertRuntimeEnv();
  const connectionString = runtimeEnv.DATABASE_URL;
  const hostname = new URL(connectionString).hostname;
  const isLocalDatabase = hostname === "localhost" || hostname === "127.0.0.1";
  const adapter = new PrismaPg(
    {
      connectionString,
      // Next dev/Turbopack birden fazla worker açabildiği için her worker'ın
      // yerel Prisma Dev sunucusuna tek bağlantı ayırması bağlantı taşmasını önler.
      max: isLocalDatabase ? 1 : runtimeEnv.DATABASE_POOL_MAX,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      // Prisma Dev'in yerel TCP katmanı sık bağlantı rotasyonunda P1017 üretebilir.
      // Üretimde uzun ömürlü sunucu havuzlarında periyodik rotasyonu koruyoruz.
      ...(isLocalDatabase ? {} : { maxUses: 7_500 }),
      keepAlive: true,
    },
  );
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
