import Link from "next/link";
import { Camera, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/public/brand-mark";

type FooterProps = {
  name: string;
  shortDescription: string;
  phone?: string | null;
  address?: string | null;
  instagramUrl?: string | null;
  logoUrl?: string | null;
  showAboutPage?: boolean;
  showContactPage?: boolean;
  showSocialLinks?: boolean;
};

export function PublicFooter(props: FooterProps) {
  return (
    <footer className="mt-auto bg-[#171512] py-10 text-[#f6f0e7] sm:py-12">
      <div className="container-shell grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_1fr]">
        <div className="max-w-sm"><BrandMark name={props.name} logoUrl={props.logoUrl} /><p className="mt-4 text-sm leading-6 text-white/65">{props.shortDescription}</p></div>
        <div><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/90">Hızlı bağlantılar</h2><nav aria-label="Footer navigasyonu" className="mt-3 grid gap-1 text-sm text-white/65"><Link className="w-fit py-1.5 hover:text-white" href="/menu">Menü</Link>{props.showAboutPage !== false ? <Link className="w-fit py-1.5 hover:text-white" href="/about">Hakkımızda</Link> : null}{props.showContactPage !== false ? <Link className="w-fit py-1.5 hover:text-white" href="/contact">İletişim ve saatler</Link> : null}</nav></div>
        <div><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/90">Bize ulaşın</h2><div className="mt-3 grid gap-2.5 text-sm text-white/70">
          {props.phone ? <a className="flex gap-2 hover:text-white" href={`tel:${props.phone}`}><Phone className="mt-0.5 size-4" />{props.phone}</a> : null}
          {props.address ? <span className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{props.address}</span> : null}
          {props.instagramUrl && props.showSocialLinks !== false ? <a className="flex gap-2 hover:text-white" href={props.instagramUrl} target="_blank" rel="noreferrer"><Camera className="size-4" />Instagram</a> : null}
        </div></div>
      </div>
      <div className="container-shell mt-8 border-t border-white/10 pt-5 text-xs text-white/45">© {new Date().getFullYear()} {props.name}. Tüm hakları saklıdır.</div>
    </footer>
  );
}
