import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { PLATFORM_COOKIE, hashPlatformToken } from "@/platform/security";

async function readPlatformSession() {
  const token = (await cookies()).get(PLATFORM_COOKIE)?.value;
  if (!token) return null;

  const session = await getDb().platformSession.findUnique({
    where: { tokenHash: hashPlatformToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) return null;
  return session;
}

export const getPlatformSession = cache(readPlatformSession);

export async function requirePlatformPage() {
  const session = await getPlatformSession();
  if (!session) redirect("/platform/login");
  return session;
}

export async function requirePlatformAction() {
  const session = await readPlatformSession();
  if (!session) throw new Error("Geliştirici oturumu bulunamadı.");
  return session;
}
