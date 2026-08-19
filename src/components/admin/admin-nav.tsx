"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Clock3, ExternalLink, LayoutDashboard, Menu, Package, QrCode, Tags, UserRound, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = readonly [label: string, href: string, icon: LucideIcon, roles: readonly string[]];

const contentRoles = ["OWNER", "EDITOR"] as const;
const ownerRoles = ["OWNER"] as const;
const groups: Array<{ label: string; items: NavItem[] }> = [
  { label: "Genel", items: [["Genel Bakış", "/admin", LayoutDashboard, contentRoles]] },
  { label: "Menü", items: [["Ürünler", "/admin/products", Package, contentRoles], ["Kategoriler", "/admin/categories", Tags, contentRoles]] },
  { label: "QR Menü", items: [["QR Kodum", "/admin/qr", QrCode, contentRoles]] },
  { label: "İşletme", items: [["İşletme Bilgileri", "/admin/settings", Building2, ownerRoles], ["Çalışma Saatleri", "/admin/opening-hours", Clock3, ownerRoles]] },
  { label: "Hesap", items: [["Profil", "/admin/profile", UserRound, contentRoles]] },
];

function NavLink({ item, pathname, dark = false }: { item: NavItem; pathname: string; dark?: boolean }) {
  const [label, href, Icon] = item;
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
  return <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors", dark ? active ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/7 hover:text-white" : active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", dark && active && "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[var(--brand-primary)]")}><Icon className="size-[1.05rem]" />{label}</Link>;
}

function Links({ role, dark = false, closeOnNavigate = false }: { role: string; dark?: boolean; closeOnNavigate?: boolean }) {
  const pathname = usePathname();
  return <nav className="grid gap-5" aria-label="Yönetim menüsü">
    {groups.map((group) => { const visible = group.items.filter((item) => item[3].includes(role)); if (!visible.length) return null; return <div key={group.label}><p className={cn("mb-1.5 px-3 text-[.66rem] font-extrabold uppercase tracking-[.16em]", dark ? "text-white/35" : "text-muted-foreground/75")}>{group.label}</p><div className="grid gap-0.5">{visible.map((item) => { const link = <NavLink item={item} pathname={pathname} dark={dark} />; return closeOnNavigate ? <SheetClose key={item[1]} asChild>{link}</SheetClose> : <div key={item[1]}>{link}</div>; })}</div></div>; })}
    <Link href="/" target="_blank" className={cn("flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors", dark ? "border-white/10 text-white/65 hover:bg-white/7 hover:text-white" : "hover:bg-muted")}><ExternalLink className="size-4" />Müşteri sitesini aç</Link>
  </nav>;
}

function AdminBrand({ name, logoUrl, dark = false }: { name: string; logoUrl?: string | null; dark?: boolean }) { return <div className="flex min-w-0 items-center gap-3"><span className={cn("relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl", dark ? "bg-white/10 text-white" : "bg-primary/10 text-primary")}>{logoUrl ? <Image src={logoUrl} alt="" fill sizes="44px" className="bg-white object-contain p-1.5" /> : <UtensilsCrossed className="size-5" />}</span><div className="min-w-0"><p className={cn("truncate text-[.95rem] font-extrabold leading-tight", dark && "text-white")}>{name}</p><p className={cn("mt-1 text-xs", dark ? "text-white/40" : "text-muted-foreground")}>Menü yönetimi</p></div></div>; }

export function AdminSidebar({ name, role, logoUrl }: { name: string; role: string; logoUrl?: string | null }) { return <aside className="admin-sidebar sticky top-0 hidden h-screen w-[16rem] shrink-0 overflow-y-auto bg-[#1d211f] px-4 py-5 lg:block"><div className="mb-7 px-1"><AdminBrand name={name} logoUrl={logoUrl} dark /></div><Links role={role} dark /></aside>; }
export function AdminMobileNav({ name, role, logoUrl }: { name: string; role: string; logoUrl?: string | null }) { return <Sheet><SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden" aria-label="Yönetim menüsünü aç"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-[88vw] max-w-sm gap-0 overflow-y-auto p-0"><SheetHeader className="border-b bg-muted/45 px-5 py-5 pr-14 text-left"><SheetTitle asChild><div><AdminBrand name={name} logoUrl={logoUrl} /></div></SheetTitle></SheetHeader><div className="p-5"><Links role={role} closeOnNavigate /></div></SheetContent></Sheet>; }
