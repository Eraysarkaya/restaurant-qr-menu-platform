import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestaurantImage } from "@/components/public/restaurant-image";
import { formatPrice } from "@/lib/format";
import { getPublicProduct, getPublicSettings } from "@/server/dal/public";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return { title: product.name, description: product.shortDescription ?? product.description, alternates: { canonical: `/menu/product/${product.slug}` } };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getPublicProduct(slug), getPublicSettings()]);
  if (!product || !settings) notFound();

  return <div className="container-shell py-7 sm:py-12"><Button asChild variant="ghost" className="-ml-3"><Link href={`/menu?category=${product.category.slug}`}><ArrowLeft />{product.category.name}</Link></Button><article className="mt-5 grid overflow-hidden rounded-2xl border bg-card shadow-soft md:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.95fr)]"><div className="relative aspect-[4/3] bg-secondary md:min-h-[32rem]"><RestaurantImage src={product.imageUrl} alt={`${product.name} görseli`} fill preload sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></div><div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10"><div className="flex flex-wrap gap-2">{product.badge ? <Badge variant="secondary">{product.badge}</Badge> : null}<Badge variant={product.isAvailable ? "outline" : "destructive"}>{product.isAvailable ? "Şu anda mevcut" : "Şu anda tükendi"}</Badge></div><h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1><p className="mt-4 text-base leading-7 text-muted-foreground">{product.description}</p><div className="mt-7 flex items-baseline gap-3"><strong className="text-2xl text-primary">{formatPrice(product.price.toString(), settings.currency, settings.locale)}</strong>{product.oldPrice ? <del className="text-sm text-muted-foreground">{formatPrice(product.oldPrice.toString(), settings.currency, settings.locale)}</del> : null}</div><p className="mt-8 border-t pt-5 text-xs leading-5 text-muted-foreground">Alerjen veya içerik bilgisi için işletmeyle iletişime geçebilirsiniz.</p></div></article></div>;
}
