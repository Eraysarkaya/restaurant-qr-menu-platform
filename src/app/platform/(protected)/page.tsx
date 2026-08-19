import Link from "next/link";
import { Building2, CircleAlert, CircleCheck, Plus } from "lucide-react";
import { getDb } from "@/server/db/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const statusLabel = { DRAFT: "Taslak", SETUP: "Kuruluyor", ACTIVE: "Aktif", MAINTENANCE: "Bakım", ERROR: "Sorunlu", ARCHIVED: "Arşiv" } as const;
const packageLabel = { QR_MENU_ONLY: "QR Menü", RESTAURANT_WEBSITE: "Web Sitesi", PREMIUM_WEBSITE: "Premium" } as const;

export default async function PlatformDashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { domain: { contains: q, mode: "insensitive" as const } }] } : {};
  const [instances, active, attention] = await Promise.all([
    getDb().restaurantInstance.findMany({ where, orderBy: { updatedAt: "desc" } }),
    getDb().restaurantInstance.count({ where: { status: "ACTIVE" } }),
    getDb().restaurantInstance.count({ where: { status: { in: ["ERROR", "MAINTENANCE"] } } }),
  ]);
  return (
    <div className="grid gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Geliştirici alanı</p><h1 className="text-3xl font-bold tracking-tight">Restoran kurulumları</h1><p className="mt-1 text-muted-foreground">Domain, paket, şablon ve dağıtım durumunu tek yerden izleyin.</p></div><Button asChild><Link href="/platform/instances/new"><Plus /> Yeni kurulum</Link></Button></header>
      <div className="grid gap-4 sm:grid-cols-3"><Card><CardContent><Building2 className="mb-3 text-primary" /><p className="text-3xl font-bold">{instances.length}</p><p className="text-sm text-muted-foreground">Görünen kurulum</p></CardContent></Card><Card><CardContent><CircleCheck className="mb-3 text-emerald-600" /><p className="text-3xl font-bold">{active}</p><p className="text-sm text-muted-foreground">Aktif</p></CardContent></Card><Card><CardContent><CircleAlert className="mb-3 text-amber-600" /><p className="text-3xl font-bold">{attention}</p><p className="text-sm text-muted-foreground">İlgi gerektiren</p></CardContent></Card></div>
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="İşletme veya alan adı ara" className="h-11 w-full max-w-md rounded-lg border bg-background px-4" /><Button type="submit" variant="outline">Ara</Button></form>
      <div className="overflow-hidden rounded-xl border bg-card">
        {instances.length ? instances.map((instance) => <Link key={instance.id} href={`/platform/instances/${instance.id}`} className="grid gap-2 border-b p-5 transition-colors last:border-0 hover:bg-muted/60 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-semibold">{instance.name}</p><p className="text-sm text-muted-foreground">{instance.domain ?? "Alan adı bekleniyor"}</p></div><span className="text-sm">{packageLabel[instance.featurePreset]}</span><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{statusLabel[instance.status]}</span></Link>) : <div className="p-10 text-center text-muted-foreground">Henüz eşleşen kurulum yok.</div>}
      </div>
    </div>
  );
}
