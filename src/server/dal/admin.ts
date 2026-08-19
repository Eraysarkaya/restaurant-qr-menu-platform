import "server-only";
import { requireAdminPage } from "@/server/auth/session";
import { getDb } from "@/server/db/client";

export async function getAdminDb() {
  await requireAdminPage();
  return getDb();
}
