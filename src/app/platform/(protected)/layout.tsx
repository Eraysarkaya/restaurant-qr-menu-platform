import Link from "next/link";
import { Building2, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { platformLogoutAction } from "@/platform/auth/actions";
import { requirePlatformPage } from "@/platform/auth/session";
import { Button } from "@/components/ui/button";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePlatformPage();
  return (
    <div className="min-h-screen bg-muted/35">
      <header className="border-b bg-[#101820] text-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-5 px-4">
          <Link href="/platform" className="mr-auto flex items-center gap-2 font-semibold"><Building2 className="size-5 text-[#e8794f]" /> Restoran Platformu</Link>
          <nav className="hidden items-center gap-1 sm:flex"><Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Link href="/platform"><LayoutDashboard /> Kurulumlar</Link></Button><Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Link href="/platform/instances/new"><Plus /> Yeni kurulum</Link></Button></nav>
          <span className="hidden text-sm text-white/60 lg:inline">{session.user.name}</span>
          <form action={platformLogoutAction}><Button type="submit" size="icon" variant="ghost" className="text-white hover:bg-white/10" aria-label="Çıkış yap"><LogOut /></Button></form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
