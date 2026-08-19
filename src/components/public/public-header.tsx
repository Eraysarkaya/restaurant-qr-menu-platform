"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { BrandMark } from "@/components/public/brand-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { sanitizeWhatsAppNumber } from "@/lib/format";

type HeaderProps = { name: string; logoUrl?: string | null; phone?: string | null; whatsapp?: string | null; showPhoneCta: boolean; showWhatsappCta: boolean; showAboutPage?: boolean; showContactPage?: boolean };
function isActive(pathname: string, href: string) { return href === "/" ? pathname === "/" : pathname.startsWith(href); }

export function PublicHeader({ name, logoUrl, phone, whatsapp, showPhoneCta, showWhatsappCta, showAboutPage = true, showContactPage = true }: HeaderProps) {
  const pathname = usePathname();
  const links = [["Menü", "/menu"], ...(showAboutPage ? [["Hakkımızda", "/about"]] : []), ...(showContactPage ? [["İletişim", "/contact"]] : [])] as const;
  return <header className="sticky top-0 z-40 min-w-0 border-b border-black/5 bg-background/92 backdrop-blur-xl"><div className="container-shell flex h-16 min-w-0 items-center justify-between gap-3 sm:gap-4">
    <BrandMark name={name} logoUrl={logoUrl} />
    <nav aria-label="Ana navigasyon" className="hidden items-center gap-6 md:flex">{links.map(([label, href]) => { const active = isActive(pathname, href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`relative rounded-md px-1 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "text-foreground after:absolute after:inset-x-1 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--brand-primary)]" : "text-muted-foreground hover:text-foreground"}`}>{label}</Link>; })}</nav>
    <div className="hidden md:block" aria-hidden="true" />
    <div className="flex shrink-0 items-center md:hidden"><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Menüyü aç"><Menu className="size-5" /></Button></SheetTrigger><SheetContent side="right" className="w-[min(88vw,24rem)] gap-0 overflow-y-auto p-0"><SheetHeader className="min-w-0 border-b bg-secondary/45 px-5 py-5 pr-14 text-left"><SheetTitle asChild><div className="min-w-0"><BrandMark name={name} logoUrl={logoUrl} subtitle="Menü ve iletişim" /></div></SheetTitle></SheetHeader><div className="flex min-w-0 flex-1 flex-col p-5"><nav aria-label="Mobil navigasyon" className="grid gap-1">{links.map(([label, href]) => <SheetClose key={href} asChild><Link href={href} aria-current={isActive(pathname, href) ? "page" : undefined} className="focus-ring flex min-h-12 items-center rounded-xl px-4 text-base font-semibold transition-colors hover:bg-secondary aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary">{label}</Link></SheetClose>)}</nav><div className="mt-auto grid min-w-0 gap-2 border-t pt-5">{phone && showPhoneCta ? <a className="focus-ring flex min-h-11 min-w-0 items-center gap-3 break-all rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground" href={`tel:${phone.replace(/\s/g, "")}`}><Phone className="size-4 shrink-0 text-primary" />{phone}</a> : null}{whatsapp && showWhatsappCta ? <a className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground" href={`https://wa.me/${sanitizeWhatsAppNumber(whatsapp)}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4 shrink-0 text-primary" />WhatsApp</a> : null}</div></div></SheetContent></Sheet></div>
  </div></header>;
}