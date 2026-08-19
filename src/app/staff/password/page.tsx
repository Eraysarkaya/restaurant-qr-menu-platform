import { InitialPasswordForm } from "@/components/admin/initial-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStaffPage } from "@/server/auth/session";

export const dynamic = "force-dynamic";
export default async function InitialPasswordPage() {
  await requireStaffPage(undefined, { allowPasswordChange: true });
  return <main className="grid min-h-screen place-items-center bg-[#171512] p-4"><Card className="w-full max-w-md"><CardHeader><CardTitle className="font-heading text-3xl">Geçici parolanızı değiştirin</CardTitle><CardDescription>Devam etmeden önce yalnız sizin bildiğiniz güçlü bir parola belirleyin.</CardDescription></CardHeader><CardContent><InitialPasswordForm /></CardContent></Card></main>;
}
