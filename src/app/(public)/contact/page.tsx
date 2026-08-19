import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/public/page-header";
import { dayName, formatOpeningHour, getRestaurantStatus } from "@/lib/opening-hours";
import { sanitizeWhatsAppNumber } from "@/lib/format";
import { getPublicSettings } from "@/server/dal/public";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicSettings(); return { title: "İletişim", description: `${settings?.name ?? "Restoran"} adres, telefon ve çalışma saatleri.`, alternates: { canonical: "/contact" } }; }

export default async function ContactPage() {
  const settings = await getPublicSettings();
  if (!settings) return null;
  if (!settings.showContactPage) notFound();
  const status = getRestaurantStatus(settings.openingHours, settings.timezone);
  const whatsappUrl = settings.whatsapp ? `https://wa.me/${sanitizeWhatsAppNumber(settings.whatsapp)}` : null;
  return <div className="container-shell py-10 sm:py-16"><PageHeader eyebrow="İletişim" title="Masamız hazır, bekleriz." description="Yol tarifi, çalışma saatleri veya sorularınız için bize ulaşın." /><div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
    <section className="surface-panel overflow-hidden"><div className="p-5 sm:p-7"><h2 className="font-heading text-2xl font-semibold">Bize ulaşın</h2><div className="mt-5 grid gap-4 text-sm">{settings.address ? <div className="flex gap-3"><MapPin className="size-5 shrink-0 text-primary" /><span>{settings.address}</span></div> : null}{settings.phone ? <a href={`tel:${settings.phone}`} className="focus-ring flex min-h-11 items-center gap-3 rounded-lg hover:text-primary"><Phone className="size-5 text-primary" />{settings.phone}</a> : null}{settings.email ? <a href={`mailto:${settings.email}`} className="focus-ring flex min-h-11 items-center gap-3 rounded-lg hover:text-primary"><Mail className="size-5 text-primary" />{settings.email}</a> : null}<div className="flex gap-3"><Clock3 className="size-5 text-primary" /><strong className={status.isOpen ? "text-green-700" : "text-red-700"}>{status.label}</strong></div></div><div className="mt-6 flex flex-wrap gap-2">{settings.googleMapsUrl ? <Button asChild><a href={settings.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation /> Yol tarifi al</a></Button> : null}{whatsappUrl ? <Button asChild variant="outline"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></Button> : null}</div></div>{settings.showMap ? settings.mapEmbedUrl ? <iframe title={`${settings.name} haritası`} src={settings.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full border-0" /> : <div className="grid h-44 place-items-center border-t bg-muted text-sm text-muted-foreground"><MapPin className="size-5" /><span>Harita işletme ayarlarından eklenebilir.</span></div> : null}</section>
    <section className="rounded-xl bg-[#211f1c] p-5 text-white sm:p-7"><h2 className="font-heading text-2xl font-semibold">Çalışma saatleri</h2><ul className="mt-5 space-y-2">{settings.openingHours.map((hour) => <li key={hour.id} className="flex justify-between gap-3 border-b border-white/10 py-2 text-sm"><span>{dayName(hour.dayOfWeek)}</span><span className="text-white/65">{formatOpeningHour(hour)}</span></li>)}</ul><p className="mt-4 text-xs text-white/45">Saatler {settings.timezone} zaman dilimine göre gösterilir.</p></section>
  </div></div>;
}
