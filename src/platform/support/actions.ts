"use server";

import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { requirePlatformAction } from "@/platform/auth/session";
import { SUPPORT_COOKIE, hashPlatformToken } from "@/platform/security";

export async function startSupportSessionAction(form: FormData) {
  const platformSession = await requirePlatformAction();
  const parsed = z.string().cuid().safeParse(form.get("instanceId"));
  if (!parsed.success) throw new Error("Kurulum bulunamadı.");
  const rate = await consumeRateLimit(`support-session:${platformSession.userId}`, 10, 3600);
  if (!rate.allowed) throw new Error("Destek oturumu sınırına ulaşıldı.");

  const instance = await getDb().restaurantInstance.findUnique({ where: { id: parsed.data } });
  if (!instance || instance.deploymentProjectId !== "local" || instance.status === "ARCHIVED") throw new Error("Bu kurulum için doğrudan destek erişimi kullanılamaz.");

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const support = await getDb().supportSession.create({ data: { instanceId: instance.id, platformUserId: platformSession.userId, tokenHash: hashPlatformToken(token), scope: "READ_ONLY_CONTENT", expiresAt } });
  await getDb().platformAuditLog.create({ data: { actorId: platformSession.userId, instanceId: instance.id, action: "SUPPORT_SESSION_STARTED", entityType: "SupportSession", entityId: support.id, metadata: { scope: support.scope, expiresAt: expiresAt.toISOString() } } });
  (await cookies()).set(SUPPORT_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", expires: expiresAt });
  redirect("/admin");
}

export async function endSupportSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPPORT_COOKIE)?.value;
  if (token) {
    const support = await getDb().supportSession.findUnique({ where: { tokenHash: hashPlatformToken(token) } });
    if (support) {
      await getDb().$transaction([
        getDb().supportSession.update({ where: { id: support.id }, data: { revokedAt: new Date() } }),
        getDb().platformAuditLog.create({ data: { actorId: support.platformUserId, instanceId: support.instanceId, action: "SUPPORT_SESSION_ENDED", entityType: "SupportSession", entityId: support.id } }),
      ]);
    }
  }
  cookieStore.set(SUPPORT_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 0 });
  redirect("/platform");
}
