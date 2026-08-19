import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { RestaurantImage } from "@/components/public/restaurant-image";

type ProductCardProps = { product: { id: string; slug: string; name: string; description: string; price: { toString(): string } | string; oldPrice?: { toString(): string } | string | null; badge?: string | null; imageUrl?: string | null; isAvailable: boolean; isFeatured: boolean }; currency?: string; locale?: string; preload?: boolean };

export function ProductCard({ product, currency, locale, preload = false }: ProductCardProps) {
  return <article className={`group grid min-h-[132px] grid-cols-[6.75rem_1fr] overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgb(40_28_18_/_0.04)] transition duration-200 hover:border-primary/25 hover:shadow-[0_10px_28px_rgb(40_28_18_/_0.07)] sm:block ${product.isAvailable ? "" : "opacity-75"}`}>
    <div className="relative min-h-32 overflow-hidden bg-secondary sm:aspect-[4/3] sm:min-h-0"><RestaurantImage src={product.imageUrl} alt={`${product.name} görseli`} fill loading={preload ? "eager" : undefined} sizes="(max-width: 640px) 108px, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-200 group-hover:scale-[1.02]" /><div className="absolute left-2 top-2 flex flex-wrap gap-1">{product.isFeatured ? <Badge className="hidden bg-[var(--brand-primary)] sm:inline-flex"><Sparkles className="size-3" /> Öne çıkan</Badge> : null}{product.badge ? <Badge variant="secondary">{product.badge}</Badge> : null}{!product.isAvailable ? <Badge variant="destructive">Şu anda tükendi</Badge> : null}</div></div>
    <div className="flex min-w-0 flex-col p-3 sm:p-4"><h3 className="line-clamp-2 font-heading text-lg font-semibold leading-tight sm:text-xl"><Link href={`/menu/product/${product.slug}`} className="focus-ring rounded-sm before:absolute">{product.name}</Link></h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">{product.description}</p><div className="mt-auto flex items-end justify-between gap-2 pt-2"><div><strong className="text-base text-[var(--brand-primary)]">{formatPrice(product.price.toString(), currency, locale)}</strong>{product.oldPrice ? <del className="ml-2 text-xs text-muted-foreground">{formatPrice(product.oldPrice.toString(), currency, locale)}</del> : null}</div><Link href={`/menu/product/${product.slug}`} className="focus-ring rounded-md px-2 py-1 text-xs font-bold text-primary hover:bg-primary/8">İncele</Link></div></div>
  </article>;
}
