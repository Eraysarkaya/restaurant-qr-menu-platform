import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { Download, ExternalLink, QrCode } from "lucide-react";
import { PrintButton } from "@/components/admin/print-button";
import { Button } from "@/components/ui/button";
import { getAdminDb } from "@/server/dal/admin";
import { appUrl } from "@/server/env";
import { buildMenuUrl } from "@/lib/qr";

export default async function QrMenuPage() {
  const db = await getAdminDb();
  const settings = await db.restaurantSettings.findUniqueOrThrow({ where: { id: "singleton" }, select: { name: true } });
  const menuUrl = buildMenuUrl(appUrl());
  const qrDataUrl = await QRCode.toDataURL(menuUrl, { width: 720, margin: 3, errorCorrectionLevel: "H", color: { dark: "#1d211f", light: "#ffffff" } });
  return <div className="mx-auto max-w-5xl space-y-6"><header><p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">QR Menü</p><h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">QR Kodum</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Bu tek QR kodu güncel menünüzü açar. Ürün veya fiyat değiştirdiğinizde yeniden bastırmanız gerekmez.</p></header><div className="grid items-start gap-5 lg:grid-cols-[minmax(20rem,.8fr)_minmax(0,1.2fr)]"><section className="qr-print-card rounded-2xl border bg-white p-6 text-center shadow-sm"><div className="mx-auto flex items-center justify-center gap-2 text-lg font-extrabold"><QrCode className="size-5 text-primary" />{settings.name}</div><div className="mx-auto mt-5 w-full max-w-80 rounded-2xl border bg-white p-3"><Image src={qrDataUrl} alt={`${settings.name} dijital menü QR kodu`} width={720} height={720} unoptimized className="size-full" /></div><p className="mt-4 text-xl font-extrabold">Menümüzü inceleyin</p><p className="mt-1 break-all text-xs text-muted-foreground">{menuUrl}</p></section><section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-extrabold">İndirme ve kullanım</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">PNG dijital kullanım ve standart baskılar; SVG ise büyük ve yüksek kaliteli baskılar için uygundur.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><Button asChild><Link href="/api/admin/qr?format=png"><Download />PNG indir</Link></Button><Button asChild variant="outline"><Link href="/api/admin/qr?format=svg"><Download />SVG indir</Link></Button><PrintButton /><Button asChild variant="outline"><Link href="/menu" target="_blank"><ExternalLink />Menüyü aç</Link></Button></div><div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><strong>QR kodunuz kalıcıdır.</strong><br />Menü içeriği veritabanından güncellendiği için fiyat ve ürün değişiklikleri aynı QR koduna otomatik yansır.</div></section></div></div>;
}
