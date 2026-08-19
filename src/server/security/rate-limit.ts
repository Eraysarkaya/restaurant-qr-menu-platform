import "server-only";
import { getDb } from "@/server/db/client";

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const db = getDb();
  const windowStart = now - windowSeconds * 1000;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.$transaction(async (tx) => {
        const record = await tx.rateLimit.findUnique({ where: { key } });
        if (!record || Number(record.lastRequest) < windowStart) {
          await tx.rateLimit.upsert({ where: { key }, update: { count: 1, lastRequest: BigInt(now) }, create: { key, count: 1, lastRequest: BigInt(now) } });
          return { allowed: true, remaining: limit - 1 };
        }
        if (record.count >= limit) return { allowed: false, remaining: 0 };
        const updated = await tx.rateLimit.update({ where: { key }, data: { count: { increment: 1 }, lastRequest: BigInt(now) } });
        return { allowed: updated.count <= limit, remaining: Math.max(0, limit - updated.count) };
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Hız sınırı denetlenemedi.");
}
