import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { endSupportSessionAction } from "@/platform/support/actions";

export const metadata: Metadata = { title: "Yönetim Paneli", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const settings = await getDb().restaurantSettings.findUnique({ where: { id: "singleton" }, select: { name: true, logoUrl: true, largeTextMode: true } });
  const name = settings?.name ?? "Restoran";
  return <div className={`admin-shell flex min-h-screen ${settings?.largeTextMode ? "text-[17px]" : ""}`}>
    <AdminSidebar name={name} role={session.user.role} logoUrl={settings?.logoUrl} />
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-black/5 bg-white/90 px-3 py-2 backdrop-blur-xl sm:px-5"><div className="flex min-w-0 items-center gap-3"><AdminMobileNav name={name} role={session.user.role} logoUrl={settings?.logoUrl} /><div className="min-w-0"><p className="truncate text-sm font-extrabold leading-tight">{session.user.name}</p><p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">{session.user.email}</p></div></div><div className="flex items-center gap-1"><Button asChild variant="ghost" size="sm" className="hidden md:inline-flex"><Link href="/" target="_blank"><ExternalLink />Müşteri sitesi</Link></Button>{session.user.isSupport ? <form action={endSupportSessionAction}><Button type="submit" variant="outline" size="sm">Destekten çık</Button></form> : <LogoutButton />}</div></header>
      {session.user.isSupport ? <div role="status" className="border-b border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-950 sm:px-5"><strong>Salt okunur destek oturumu.</strong> Değişiklik ve kayıt işlemleri sunucu tarafından engellenir.</div> : null}
      <main id="main-content" className="admin-content flex-1 p-4 sm:p-5 lg:p-6 xl:p-8">{children}</main>
    </div>
  </div>;
}
