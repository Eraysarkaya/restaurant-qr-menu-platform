"use server";

import "server-only";
import { hashPassword } from "better-auth/crypto";
import { headers } from "next/headers";
import { auth } from "@/server/auth/auth";
import { getSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import type { ActionState } from "@/lib/action-state";

export async function changeInitialPasswordAction(_state: ActionState, form: FormData): Promise<ActionState> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, message: "Oturum bulunamadı." };
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    if (newPassword.length < 12 || newPassword.length > 128) return { ok: false, message: "Yeni parola 12-128 karakter olmalıdır." };
    await auth.api.verifyPassword({ headers: await headers(), body: { password: currentPassword } });
    const password = await hashPassword(newPassword);
    await getDb().$transaction([
      getDb().account.update({ where: { providerId_accountId: { providerId: "credential", accountId: session.user.id } }, data: { password } }),
      getDb().user.update({ where: { id: session.user.id }, data: { mustChangePassword: false } }),
      getDb().session.deleteMany({ where: { userId: session.user.id, id: { not: session.session.id } } }),
    ]);
    return { ok: true, message: "Parolanız değiştirildi. Artık operasyon ekranını kullanabilirsiniz." };
  } catch { return { ok: false, message: "Mevcut parola doğrulanamadı." }; }
}
