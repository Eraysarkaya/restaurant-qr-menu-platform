import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/enums";
import { auth } from "@/server/auth/auth";
import { hasPermission, roleHome, type Permission } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import { SUPPORT_COOKIE, hashPlatformToken } from "@/platform/security";
import { cookies } from "next/headers";

async function readVerifiedSession(allowSupport = true) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    const staff = await getDb().user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true, mustChangePassword: true },
    });
    if (!staff?.isActive) return null;
    return { ...session, user: { ...session.user, ...staff, isSupport: false } };
  }
  if (!allowSupport) return null;
  const supportToken = (await cookies()).get(SUPPORT_COOKIE)?.value;
  if (!supportToken) return null;
  const support = await getDb().supportSession.findUnique({ where: { tokenHash: hashPlatformToken(supportToken) }, include: { platformUser: true, instance: true } });
  if (!support || support.expiresAt <= new Date() || support.revokedAt || !support.platformUser.isActive || support.instance.deploymentProjectId !== "local") return null;
  if (!support.usedAt) await getDb().supportSession.update({ where: { id: support.id }, data: { usedAt: new Date() } });
  return {
    session: { id: support.id, token: "", userId: `support:${support.platformUserId}`, expiresAt: support.expiresAt, createdAt: support.createdAt, updatedAt: support.createdAt, ipAddress: null, userAgent: null },
    user: { id: `support:${support.platformUserId}`, name: `${support.platformUser.name} · Destek`, email: "Salt okunur destek oturumu", emailVerified: true, image: null, role: "EDITOR" as const, isActive: true, mustChangePassword: false, createdAt: support.createdAt, updatedAt: support.createdAt, isSupport: true },
  };
}

export const getSession = cache(readVerifiedSession);

export async function requireStaffPage(permission?: Permission, options?: { allowPasswordChange?: boolean }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.user.mustChangePassword && !options?.allowPasswordChange) redirect("/staff/password");
  if (permission && !hasPermission(session.user.role as UserRole, permission)) redirect(roleHome());
  return session;
}

export async function requireStaffAction(permission: Permission) {
  const session = await readVerifiedSession(false);
  if (!session || !hasPermission(session.user.role as UserRole, permission)) {
    throw new Error("Bu işlem için yetkiniz yok.");
  }
  if (session.user.mustChangePassword) throw new Error("Önce geçici parolanızı değiştirin.");
  return session;
}

export function requireAdminPage() {
  return requireStaffPage("ADMIN_ACCESS");
}

export function requireAdminAction(permission: Permission = "ADMIN_ACCESS") {
  return requireStaffAction(permission);
}
