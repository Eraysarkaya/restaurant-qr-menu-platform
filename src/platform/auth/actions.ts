"use server";

import "server-only";
import { randomBytes } from "node:crypto";
import { verifyPassword } from "better-auth/crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { getDb } from "@/server/db/client";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { PLATFORM_COOKIE, hashPlatformToken } from "@/platform/security";

const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta yazın.").transform((value) => value.toLowerCase()),
  password: z.string().min(12, "Parola en az 12 karakter olmalıdır.").max(128),
});

function requestIp(requestHeaders: Headers) {
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

export async function platformLoginAction(_state: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, message: "Bilgileri kontrol edin.", fieldErrors: parsed.error.flatten().fieldErrors };

  const requestHeaders = await headers();
  const ip = requestIp(requestHeaders);
  const rate = await consumeRateLimit(`platform-login:${ip}`, 5, 300);
  if (!rate.allowed) return { ok: false, message: "Çok fazla giriş denemesi yapıldı. Beş dakika sonra tekrar deneyin." };

  const user = await getDb().platformUser.findUnique({ where: { email: parsed.data.email } });
  const valid = user?.isActive && await verifyPassword({ hash: user.passwordHash, password: parsed.data.password });
  if (!user || !valid) return { ok: false, message: "E-posta veya parola hatalı." };

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await getDb().$transaction([
    getDb().platformSession.create({
      data: {
        userId: user.id,
        tokenHash: hashPlatformToken(token),
        expiresAt,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: requestHeaders.get("user-agent")?.slice(0, 300),
      },
    }),
    getDb().platformUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    getDb().platformAuditLog.create({ data: { actorId: user.id, action: "PLATFORM_LOGIN", entityType: "PlatformUser", entityId: user.id } }),
  ]);

  (await cookies()).set(PLATFORM_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/platform",
    expires: expiresAt,
  });
  redirect("/platform");
}

export async function platformLogoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLATFORM_COOKIE)?.value;
  if (token) await getDb().platformSession.deleteMany({ where: { tokenHash: hashPlatformToken(token) } });
  cookieStore.set(PLATFORM_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/platform", maxAge: 0 });
  redirect("/platform/login");
}
