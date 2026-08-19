import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/public/product-card";
import { RestaurantImage } from "@/components/public/restaurant-image";
import { RestaurantStatus } from "@/components/public/restaurant-status";
import { getRestaurantStatus } from "@/lib/opening-hours";
import { getFeaturedProducts, getPublicSettings } from "@/server/dal/public";
import { appUrl } from "@/server/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, products] = await Promise.all([getPublicSettings(), getFeaturedProducts()]);
  if (!settings) return null;
  if (!settings.showHomePage) redirect("/menu");

  const status = getRestaurantStatus(settings.openingHours, settings.timezone);
  const featuredProducts = products.slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.name,
    description: settings.shortDescription,
    url: appUrl(),
    telephone: settings.phone,
    email: settings.email,
    address: settings.address,
    image: settings.heroImageUrl,
    sameAs: settings.showSocialLinks ? [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl, settings.youtubeUrl, settings.xUrl].filter(Boolean) : [],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

    {settings.showHero ? <section className="relative isolate flex h-[min(70svh,620px)] min-h-[500px] items-end overflow-hidden bg-[#211f1c] text-white sm:min-h-[520px]">
      <RestaurantImage
        src={settings.heroImageUrl ?? "/demo/restaurant-interior-v2.png"}
        alt={`${settings.name} atmosferi`}
        fill
        preload
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: `${settings.heroFocalX}% ${settings.heroFocalY}%` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,16,13,.82)_0%,rgba(18,16,13,.55)_48%,rgba(18,16,13,.12)_78%),linear-gradient(0deg,rgba(18,16,13,.62)_0%,transparent_48%)] max-sm:bg-[linear-gradient(0deg,rgba(18,16,13,.88)_0%,rgba(18,16,13,.42)_65%,rgba(18,16,13,.18)_100%)]" />
      <div className="container-shell relative z-10 pb-10 pt-28 sm:pb-14 lg:pb-16">
        <div className="max-w-2xl">
          <RestaurantStatus openingHours={settings.openingHours} timezone={settings.timezone} initialStatus={status} />
          <h1 className="mt-5 line-clamp-2 text-balance font-heading text-[2.55rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-4 line-clamp-3 max-w-xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
            {settings.heroSubtitle}
          </p>
          <Button asChild size="lg" className="mt-7 min-w-40 shadow-lg">
            <Link href="/menu">Menüyü gör <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </section> : null}

    {settings.showFeaturedProducts && featuredProducts.length ? <section aria-labelledby="featured-title" className="container-shell py-12 sm:py-16 lg:py-20">
      <div className="max-w-2xl">
        <p className="eyebrow">Öne çıkanlar</p>
        <h2 id="featured-title" className="mt-2 font-heading text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Bugünün sevilen lezzetleri</h2>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProducts.map((product) => <ProductCard key={product.id} product={product} currency={settings.currency} locale={settings.locale} />)}
      </div>
    </section> : null}
  </>;
}
