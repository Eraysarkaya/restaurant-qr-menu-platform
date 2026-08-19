import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlatformLoginForm } from "@/components/platform/platform-login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformSession } from "@/platform/auth/session";

export const metadata: Metadata = { title: "Geliştirici Kontrolü", robots: { index: false, follow: false } };

export default async function PlatformLoginPage() {
  if (await getPlatformSession()) redirect("/platform");
  return (
    <main className="grid min-h-screen place-items-center bg-[#101820] p-4">
      <Card className="w-full max-w-md border-white/10 shadow-2xl">
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Platform kontrolü</p>
          <CardTitle className="text-3xl">Geliştirici girişi</CardTitle>
          <CardDescription>Restoran yönetici hesaplarından tamamen ayrı, denetlenebilir kontrol alanı.</CardDescription>
        </CardHeader>
        <CardContent><PlatformLoginForm /></CardContent>
      </Card>
    </main>
  );
}
