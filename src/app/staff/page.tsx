import { redirect } from "next/navigation";
import { roleHome } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function StaffRedirectPage() {
  await requireStaffPage();
  redirect(roleHome());
}
