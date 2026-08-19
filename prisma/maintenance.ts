import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL tanımlı değil.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1 }) });

async function main() {
  const now = new Date();
  const staleRateLimit = BigInt(Date.now() - 24 * 60 * 60 * 1000);
  const auditRetention = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const [sessions, verifications, rateLimits, auditLogs] = await prisma.$transaction([
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.rateLimit.deleteMany({ where: { lastRequest: { lt: staleRateLimit } } }),
    prisma.auditLog.deleteMany({ where: { createdAt: { lt: auditRetention } } }),
  ]);

  console.log({
    expiredSessions: sessions.count,
    expiredVerifications: verifications.count,
    staleRateLimits: rateLimits.count,
    expiredAuditLogs: auditLogs.count,
  });
}

main().finally(async () => prisma.$disconnect());
