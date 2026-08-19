import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/public/brand-mark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicSettings } from "@/server/dal/public";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const settings = await getPublicSettings();
  const { setup } = await searchParams;
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-[#171512] p-4">
      <Card className="w-full max-w-md border-white/10 shadow-2xl">
        <CardHeader className="space-y-5">
          <BrandMark name={settings?.name ?? "Restoran"} />
          <div>
            <CardTitle className="font-heading text-3xl">Yönetici girişi</CardTitle>
            <CardDescription className="mt-2">
              Menüyü ve işletme bilgilerini güvenli biçimde yönetin.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {setup === "complete" ? <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">Hesabınız oluşturuldu. Şimdi yeni parolanızla giriş yapın.</p> : null}
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
