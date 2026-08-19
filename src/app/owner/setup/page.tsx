import type { Metadata } from "next";
import { OwnerSetupForm } from "@/components/platform/owner-setup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "İşletme Hesabı Kurulumu", robots: { index: false, follow: false } };

export default function OwnerSetupPage() {
  return <main className="grid min-h-screen place-items-center bg-muted/40 p-4"><Card className="w-full max-w-lg"><CardHeader><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Güvenli kurulum</p><CardTitle className="text-3xl">İşletme hesabınızı oluşturun</CardTitle><CardDescription>Geliştiricinizin verdiği 24 saatlik tek kullanımlık kodu kullanın. Kod ve parolanız düz metin olarak saklanmaz.</CardDescription></CardHeader><CardContent><OwnerSetupForm /></CardContent></Card></main>;
}
