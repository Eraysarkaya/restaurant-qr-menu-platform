"use server";

import "server-only";
import { hashPassword } from "better-auth/crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { hashPlatformToken } from "@/platform/security";
import { getDb } from "@/server/db/client";
import { consumeRateLimit } from "@/server/security/rate-limit";

const schema = z.object({
  token: z.string().trim().min(32, "Kurulum kodu geçersiz.").max(128),
  name: z.string().trim().min(2, "Adınızı yazın.").max(100),
  password: z.string().min(12, "Parola en az 12 karakter olmalıdır.").max(128),
  confirmation: z.string(),
}).refine((data) => data.password === data.confirmation, { path: ["confirmation"], message: "Parolalar eşleşmiyor." });

export async function acceptOwnerInvitationAction(_state: ActionState, form: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return { ok: false, message: "Kurulum bilgilerini kontrol edin.", fieldErrors: parsed.error.flatten().fieldErrors };
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  const rate = await consumeRateLimit(`owner-setup:${ip}`, 8, 3600);
  if (!rate.allowed) return { ok: false, message: "Çok fazla deneme yapıldı. Daha sonra tekrar deneyin." };

  try {
    const invitation = await getDb().ownerInvitation.findUnique({ where: { tokenHash: hashPlatformToken(parsed.data.token) }, include: { instance: true } });
    if (!invitation || invitation.usedAt || invitation.expiresAt <= new Date() || invitation.instance.deploymentProjectId !== "local") return { ok: false, message: "Kurulum kodu geçersiz veya süresi dolmuş." };
    const passwordHash = await hashPassword(parsed.data.password);
    await getDb().$transaction(async (transaction) => {
      const consumed = await transaction.ownerInvitation.updateMany({ where: { id: invitation.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
      if (consumed.count !== 1) throw new Error("INVITATION_ALREADY_USED");
      const user = await transaction.user.upsert({
        where: { email: invitation.email },
        update: { name: parsed.data.name, role: "OWNER", isActive: true, emailVerified: true, mustChangePassword: false },
        create: { name: parsed.data.name, email: invitation.email, role: "OWNER", isActive: true, emailVerified: true },
      });
      await transaction.account.upsert({ where: { providerId_accountId: { providerId: "credential", accountId: user.id } }, update: { password: passwordHash, userId: user.id }, create: { providerId: "credential", accountId: user.id, userId: user.id, password: passwordHash } });
      await transaction.platformAuditLog.create({ data: { instanceId: invitation.instanceId, action: "OWNER_INVITATION_ACCEPTED", entityType: "OwnerInvitation", entityId: invitation.id } });
    });
  } catch {
    return { ok: false, message: "Kurulum tamamlanamadı. Kod kullanılmış veya süresi dolmuş olabilir." };
  }
  redirect("/admin/login?setup=complete");
}
