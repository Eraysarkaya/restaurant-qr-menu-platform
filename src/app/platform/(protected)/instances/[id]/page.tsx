import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { InstanceForm } from "@/components/platform/instance-form";
import { InvitationForm } from "@/components/platform/invitation-form";
import { getDb } from "@/server/db/client";
import { startSupportSessionAction } from "@/platform/support/actions";
import { Button } from "@/components/ui/button";

export default async function InstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instance = await getDb().restaurantInstance.findUnique({ where: { id }, include: { auditLogs: { orderBy: { createdAt: "desc" }, take: 8 } } });
  if (!instance) notFound();
  return <div className="grid gap-7"><Link href="/platform" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Kurulumlara dön</Link><header><p className="text-sm font-semibold text-primary">{instance.slug}</p><h1 className="text-3xl font-bold">{instance.name}</h1><p className="mt-1 text-muted-foreground">Kurulum, görünüm ve dağıtım bağlamı</p></header><div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><InstanceForm initial={instance} /><div className="grid gap-6">{instance.deploymentProjectId === "local" ? <form action={startSupportSessionAction} className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50 p-5"><input type="hidden" name="instanceId" value={instance.id} /><div><h2 className="font-semibold text-sky-950">Güvenli destek erişimi</h2><p className="mt-1 text-sm text-sky-900/75">30 dakika geçerli salt-okunur oturum açar ve denetim kaydı oluşturur.</p></div><Button type="submit" variant="outline">Destek oturumu başlat</Button></form> : null}<InvitationForm instanceId={instance.id} defaultEmail={instance.primaryContactEmail} /><section className="rounded-xl border bg-card p-5"><h2 className="text-lg font-semibold">Son güvenlik hareketleri</h2><div className="mt-4 grid gap-3">{instance.auditLogs.length ? instance.auditLogs.map((log) => <div key={log.id} className="border-l-2 pl-3"><p className="text-sm font-medium">{log.action}</p><time className="text-xs text-muted-foreground">{log.createdAt.toLocaleString("tr-TR")}</time></div>) : <p className="text-sm text-muted-foreground">Henüz hareket yok.</p>}</div></section></div></div></div>;
}
