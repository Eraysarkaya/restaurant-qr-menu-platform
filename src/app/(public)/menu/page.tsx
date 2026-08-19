import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/public/product-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getActiveCategories, getMenu, getPublicSettings } from "@/server/dal/public";

export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicSettings(); return { title: "Menü", description: `${settings?.name ?? "Restoran"} güncel yiyecek ve içecek menüsü.`, alternates: { canonical: "/menu" } }; }
function menuHref(category: string | undefined, query: string) { const params = new URLSearchParams(); if (category) params.set("category", category); if (query) params.set("q", query); const value = params.toString(); return value ? `/menu?${value}` : "/menu"; }

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 80);
  const requestedCategory = (params.category ?? "").trim().slice(0, 100);
  const [settings, categories] = await Promise.all([getPublicSettings(), getActiveCategories()]);
  if (!settings) return null;
  const selectedCategory = categories.some((item) => item.slug === requestedCategory) ? requestedCategory : undefined;
  const menu = await getMenu(selectedCategory, query || undefined);
  const productCount = menu.reduce((sum, category) => sum + category.products.length, 0);
  const firstProductId = menu.find((category) => category.products.length)?.products[0]?.id;

  return <div className="pb-16"><section className="border-b bg-white/60"><div className="container-shell py-7 sm:py-10"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow">Güncel menü</p><h1 className="mt-1 text-balance font-heading text-3xl font-semibold tracking-[-.035em] sm:text-5xl">Bugün ne yiyelim?</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Kategori seçin veya ürün adıyla arayın.</p></div><form className="flex w-full max-w-md gap-2" role="search">{selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}<div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Menüde ara" name="q" defaultValue={query} maxLength={80} placeholder="Ürün ara…" className="pl-9" /></div><Button type="submit" aria-label="Ara"><Search /><span className="hidden sm:inline">Ara</span></Button></form></div></div></section>
    <div className="sticky top-16 z-30 border-b bg-background/96 backdrop-blur-xl"><nav aria-label="Menü kategorileri" className="container-shell flex h-[3.25rem] items-center gap-2 overflow-x-auto [scrollbar-width:none]"><Link href={menuHref(undefined, query)} aria-current={!selectedCategory ? "page" : undefined} className={cn("focus-ring shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition", !selectedCategory ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>Tümü</Link>{categories.map((category) => <Link key={category.id} href={menuHref(category.slug, query)} aria-current={selectedCategory === category.slug ? "page" : undefined} className={cn("focus-ring shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition", selectedCategory === category.slug ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>{category.name}</Link>)}</nav></div>
    <div className="container-shell pt-7">{productCount === 0 ? <EmptyState icon={Search} title="Ürün bulunamadı" description="Aramayı değiştirin veya tüm menüye dönün." action={<Button asChild variant="outline"><Link href="/menu">Filtreleri temizle</Link></Button>} /> : <div className="space-y-10">{menu.map((category) => category.products.length ? <section key={category.id} className="menu-section"><div className="flex items-end justify-between gap-4 border-b pb-3"><div><h2 className="font-heading text-2xl font-semibold sm:text-3xl">{category.name}</h2>{category.description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p> : null}</div><span className="shrink-0 text-xs font-semibold text-muted-foreground">{category.products.length} ürün</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{category.products.map((product) => <ProductCard key={product.id} product={product} currency={settings.currency} locale={settings.locale} preload={product.id === firstProductId} />)}</div></section> : null)}</div>}</div>
  </div>;
}
