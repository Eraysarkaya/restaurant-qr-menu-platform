import type { Metadata } from "next";
import { HeartHandshake, Leaf, Utensils } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import { RestaurantImage } from "@/components/public/restaurant-image";
import { getPublicSettings } from "@/server/dal/public";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicSettings(); return { title: "Hakkımızda", description: `${settings?.name ?? "Restoran"} işletmesinin hikâyesi, mutfak yaklaşımı ve değerleri.`, alternates: { canonical: "/about" } }; }

export default async function AboutPage() {
  const settings = await getPublicSettings();
  if (!settings) return null;
  if (!settings.showAboutPage) notFound();
  const values = [[Leaf, "Taze ve sade", "İyi malzeme ve doğru pişirme; mutfağımızın en temel iki kuralı."], [Utensils, "Günlük hazırlık", "Soslarımızdan köftelerimize kadar temel ürünlerimizi günlük hazırlıyoruz."], [HeartHandshake, "Mahalle sıcaklığı", "Her misafirin tanıdık bir masaya oturmuş gibi hissetmesini önemsiyoruz."]] as const;
  return <div>
    <section className="container-shell grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[.88fr_1.12fr] lg:gap-12 lg:py-16"><div><PageHeader eyebrow="Hakkımızda" title="İyi yemeğin başladığı küçük bir köşe." /><p className="mt-6 whitespace-pre-line text-base leading-8 text-muted-foreground">{settings.longDescription}</p></div><div className="shadow-soft relative h-[300px] overflow-hidden rounded-2xl sm:h-[420px] lg:h-[520px]"><RestaurantImage src="/demo/restaurant-interior-v2.png" alt={`${settings.name} restoranının sıcak ve sade iç mekânı`} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div></section>
    <section className="border-y bg-white/65 py-10 sm:py-14"><div className="container-shell grid gap-3 md:grid-cols-3">{values.map(([Icon, title, text]) => <article key={title} className="rounded-xl border bg-card p-5 sm:p-6"><span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-5" /></span><h2 className="mt-4 font-heading text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></section>
  </div>;
}
