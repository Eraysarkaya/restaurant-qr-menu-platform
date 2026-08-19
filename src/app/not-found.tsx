import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <div className="container-shell grid min-h-[70vh] place-items-center py-20 text-center"><div><p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">404</p><h1 className="mt-4 font-heading text-5xl font-bold">Aradığınız sayfa burada değil.</h1><p className="mt-4 text-muted-foreground">Menümüze dönüp lezzetli bir şeyler seçebilirsiniz.</p><Button asChild className="mt-7"><Link href="/menu">Menüye dön</Link></Button></div></div>; }
