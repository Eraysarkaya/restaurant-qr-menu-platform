"use client";

import Image from "next/image";
import { useActionState, useState, type CSSProperties } from "react";
import { Check, Crosshair, MonitorSmartphone, Palette } from "lucide-react";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { ImageInput } from "@/components/admin/image-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { getPublicTheme, PUBLIC_THEME_PRESETS, type PublicFontPreset, type PublicThemePreset } from "@/lib/public-theme";
import { createInstanceAction, updateInstanceAction } from "@/platform/instances/actions";

type InstanceInitial = {
  id?: string; name?: string; domain?: string | null; templatePreset?: string; fontPreset?: string; featurePreset?: string; status?: string;
  primaryContactName?: string | null; primaryContactEmail?: string | null; deploymentProjectId?: string | null; managementEndpoint?: string | null;
  logoUrl?: string | null; heroImageUrl?: string | null; heroFocalX?: number; heroFocalY?: number; primaryColor?: string; accentColor?: string;
  ownerCanEditBranding?: boolean; showHomePage?: boolean; showAboutPage?: boolean; showContactPage?: boolean; showHero?: boolean; showFeaturedProducts?: boolean; showMap?: boolean; showSocialLinks?: boolean;
};

const SAMPLE_HEROES = [
  { url: "/demo/restaurant-interior-v2.png", label: "Mekân" },
  { url: "/demo/hero-kose-mutfak.png", label: "Sofra" },
  { url: "/demo/burger.png", label: "Ürün" },
] as const;

const FOCAL_POINTS = [[0, 0], [50, 0], [100, 0], [0, 50], [50, 50], [100, 50], [0, 100], [50, 100], [100, 100]] as const;

function TemplateCard({ value, selected, onChange }: { value: PublicThemePreset; selected: boolean; onChange: (value: PublicThemePreset) => void }) {
  const preset = PUBLIC_THEME_PRESETS[value];
  return <label className={`relative cursor-pointer rounded-2xl border-2 p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
    <input className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" type="radio" name="templatePreset" value={value} checked={selected} onChange={() => onChange(value)} />
    <span className="grid h-24 grid-cols-[.7fr_1.3fr] overflow-hidden rounded-xl border bg-white" aria-hidden="true"><span style={{ background: preset.secondary }} className="p-2"><span className="block h-2 w-8 rounded-full bg-primary" /></span><span className="p-2"><span className="block h-2 w-12 rounded bg-[#292723]" /><span className="mt-3 block h-1.5 rounded bg-[#ddd7ce]" /><span className="mt-1 block h-1.5 w-3/4 rounded bg-[#ddd7ce]" /><span className="mt-4 block h-5 w-14 rounded bg-primary" /></span></span>
    <span className="mt-3 flex items-center justify-between"><strong>{preset.label}</strong><span className={`grid size-6 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>{selected ? <Check className="size-3.5" /> : null}</span></span>
    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{preset.description}</span>
  </label>;
}

function VisualPreview({ name, theme, font, primary, accent, hero, focalX, focalY }: { name: string; theme: PublicThemePreset; font: PublicFontPreset; primary: string; accent: string; hero: string; focalX: number; focalY: number }) {
  const style = getPublicTheme(theme, primary, accent, font) as CSSProperties;
  return <aside className="grid content-start gap-3 xl:sticky xl:top-24">
    <div className="flex items-center gap-2"><MonitorSmartphone className="size-4 text-primary" /><div><p className="text-sm font-bold">Anlık site önizlemesi</p><p className="text-xs text-muted-foreground">Seçimler kaydedildiğinde müşteri sitesine uygulanır.</p></div></div>
    <div style={style} data-theme={theme} className="public-site overflow-hidden rounded-2xl border bg-background shadow-xl">
      <div className="flex h-12 items-center justify-between border-b px-4 text-xs font-bold"><span className="max-w-40 truncate">{name || "Restoran"}</span><span>Menü · İletişim</span></div>
      <div className="relative h-64 bg-[#211f1c] text-white"><Image src={hero || SAMPLE_HEROES[0].url} alt="Seçili restoran şablonu önizlemesi" fill sizes="430px" className="object-cover" style={{ objectPosition: `${focalX}% ${focalY}%` }} /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="font-heading text-2xl font-semibold">Lezzetin size özel hali.</p><p className="mt-2 max-w-xs text-xs leading-5 text-white/75">Marka renkleri, logo, fotoğraf ve yazı stili tek yerden yönetilir.</p><span className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Menüyü gör</span></div></div>
      <div className="grid grid-cols-3 gap-2 p-3">{[0, 1, 2].map((item) => <span key={item} className="h-16 rounded-lg border bg-card" />)}</div>
    </div>
  </aside>;
}

export function InstanceForm({ initial = {} }: { initial?: InstanceInitial }) {
  const handler = initial.id ? updateInstanceAction : createInstanceAction;
  const [state, action, pending] = useActionState(handler, INITIAL_ACTION_STATE);
  const [name, setName] = useState(initial.name ?? "");
  const [theme, setTheme] = useState<PublicThemePreset>((initial.templatePreset as PublicThemePreset) || "WARM");
  const [font, setFont] = useState<PublicFontPreset>((initial.fontPreset as PublicFontPreset) || "LORA");
  const [primary, setPrimary] = useState(initial.primaryColor ?? "#B4532A");
  const [accent, setAccent] = useState(initial.accentColor ?? "#66704A");
  const [hero, setHero] = useState(initial.heroImageUrl ?? SAMPLE_HEROES[0].url);
  const [focal, setFocal] = useState({ x: initial.heroFocalX ?? 50, y: initial.heroFocalY ?? 50 });

  return <form action={action} className="grid gap-6">
    {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
    <ActionFeedback state={state} />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="grid gap-6">
        <section className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><h2 className="text-lg font-bold">İşletme ve yayın</h2><p className="mt-1 text-sm text-muted-foreground">Bu alanlar kurulumu tanımlar; müşteri sitesi içeriği işletme panelinden yönetilir.</p></div>
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="name">İşletme adı</Label><Input id="name" name="name" value={name} onChange={(event) => setName(event.target.value)} required /><FieldError errors={state.fieldErrors?.name} /></div>
          <div className="grid gap-2"><Label htmlFor="domain">Alan adı</Label><Input id="domain" name="domain" placeholder="restoran.com" defaultValue={initial.domain ?? ""} /><FieldError errors={state.fieldErrors?.domain} /></div>
          <div className="grid gap-2"><Label htmlFor="status">Kurulum durumu</Label><select id="status" name="status" defaultValue={initial.status ?? "DRAFT"} className="h-11 rounded-lg border bg-background px-3"><option value="DRAFT">Taslak</option><option value="SETUP">Kuruluyor</option><option value="ACTIVE">Aktif</option><option value="MAINTENANCE">Bakım</option><option value="ERROR">Sorunlu</option><option value="ARCHIVED">Arşiv</option></select></div>
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="featurePreset">Site paketi</Label><select id="featurePreset" name="featurePreset" defaultValue={initial.featurePreset ?? "RESTAURANT_WEBSITE"} className="h-11 rounded-lg border bg-background px-3"><option value="QR_MENU_ONLY">Yalnız QR Menü</option><option value="RESTAURANT_WEBSITE">Restoran Web Sitesi</option><option value="PREMIUM_WEBSITE">Premium Web Sitesi</option></select></div>
        </section>

        <section className="grid gap-6 rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Palette className="size-5" /></span><div><h2 className="text-lg font-bold">Görsel kimlik</h2><p className="mt-1 text-sm text-muted-foreground">Hazır şablonu seçin, ardından renk, yazı ve görselleri markaya uyarlayın.</p></div></div>
          <fieldset className="grid gap-3"><legend className="mb-1 text-sm font-bold">1. Hazır site şablonu</legend><div className="grid gap-3 sm:grid-cols-3">{(Object.keys(PUBLIC_THEME_PRESETS) as PublicThemePreset[]).map((value) => <TemplateCard key={value} value={value} selected={theme === value} onChange={setTheme} />)}</div></fieldset>
          <fieldset className="grid gap-3"><legend className="text-sm font-bold">2. Yazı stili</legend><div className="grid gap-3 sm:grid-cols-2">{([['LORA', 'Samimi ve karakterli', 'Restoran ve lokantalar için'], ['MANROPE', 'Temiz ve çağdaş', 'Kafe ve modern markalar için']] as const).map(([value, title, description]) => <label key={value} className={`flex min-h-16 cursor-pointer items-center justify-between rounded-xl border-2 px-4 ${font === value ? "border-primary bg-primary/5" : "border-border"}`}><span><strong className={value === "LORA" ? "font-[var(--font-lora)]" : "font-[var(--font-manrope)]"}>{title}</strong><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span><input type="radio" name="fontPreset" value={value} checked={font === value} onChange={() => setFont(value)} className="size-4 accent-primary" /></label>)}</div></fieldset>
          <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="primaryColor">3. Ana renk</Label><div className="flex gap-2"><Input id="primaryColor" name="primaryColor" type="color" value={primary} onChange={(event) => setPrimary(event.target.value)} className="w-16 p-1" /><Input value={primary} onChange={(event) => setPrimary(event.target.value)} aria-label="Ana rengin hex değeri" /></div><FieldError errors={state.fieldErrors?.primaryColor} /></div><div className="grid gap-2"><Label htmlFor="accentColor">İkincil renk</Label><div className="flex gap-2"><Input id="accentColor" name="accentColor" type="color" value={accent} onChange={(event) => setAccent(event.target.value)} className="w-16 p-1" /><Input value={accent} onChange={(event) => setAccent(event.target.value)} aria-label="İkincil rengin hex değeri" /></div><FieldError errors={state.fieldErrors?.accentColor} /></div></div>
          <ImageInput name="logo" label="4. Logo" currentUrl={initial.logoUrl} removeName="removeLogo" aspectClass="aspect-square max-w-40" imageClassName="object-contain p-2" />
          <fieldset className="grid gap-3"><legend className="text-sm font-bold">5. Hazır kapak görseli</legend><div className="grid gap-3 sm:grid-cols-3">{SAMPLE_HEROES.map((sample) => <label key={sample.url} className={`relative cursor-pointer overflow-hidden rounded-xl border-2 ${hero === sample.url ? "border-primary" : "border-border"}`}><input type="radio" name="selectedHeroUrl" value={sample.url} checked={hero === sample.url} onChange={() => setHero(sample.url)} className="sr-only" /><span className="relative block aspect-[4/3]"><Image src={sample.url} alt={`${sample.label} örnek kapak görseli`} fill sizes="220px" className="object-cover" /></span><span className="flex items-center justify-between px-3 py-2 text-sm font-semibold">{sample.label}{hero === sample.url ? <Check className="size-4 text-primary" /> : null}</span></label>)}</div></fieldset>
          <ImageInput name="heroImage" label="Veya kendi kapak görselinizi yükleyin" currentUrl={initial.heroImageUrl} removeName="removeHeroImage" aspectClass="aspect-video max-w-2xl" onPreviewChange={setHero} />
          <div className="grid gap-2"><Label>6. Fotoğraf odağı</Label><div className="grid w-40 grid-cols-3 gap-1 rounded-xl border bg-muted p-2" role="group" aria-label="Kapak görseli odak noktası">{FOCAL_POINTS.map(([x, y]) => <button key={`${x}-${y}`} type="button" aria-label={`Yatay yüzde ${x}, dikey yüzde ${y}`} aria-pressed={focal.x === x && focal.y === y} onClick={() => setFocal({ x, y })} className={`grid size-10 place-items-center rounded-lg border ${focal.x === x && focal.y === y ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}><Crosshair className="size-4" /></button>)}</div><input type="hidden" name="heroFocalX" value={focal.x} /><input type="hidden" name="heroFocalY" value={focal.y} /></div>
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-5"><div><h2 className="text-lg font-bold">Görünür sayfalar</h2><p className="text-sm text-muted-foreground">İşletmenin kullanmayacağı bölümleri kapatın.</p></div><div className="grid gap-3 sm:grid-cols-2">{([['ownerCanEditBranding', 'İşletme sahibi görünümü değiştirebilir'], ['showHomePage', 'Ana sayfa'], ['showAboutPage', 'Hakkımızda'], ['showContactPage', 'İletişim'], ['showHero', 'Kapak alanı'], ['showFeaturedProducts', 'Öne çıkan ürünler'], ['showMap', 'Harita'], ['showSocialLinks', 'Sosyal medya']] as const).map(([field, label]) => <label key={field} className="flex min-h-12 items-center gap-3 rounded-xl border px-3 text-sm font-semibold"><input type="checkbox" name={field} defaultChecked={initial[field] ?? field !== "ownerCanEditBranding"} className="size-4 accent-primary" />{label}</label>)}</div></section>

        <section className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="primaryContactName">Yetkili adı</Label><Input id="primaryContactName" name="primaryContactName" defaultValue={initial.primaryContactName ?? ""} /></div><div className="grid gap-2"><Label htmlFor="primaryContactEmail">Yetkili e-postası</Label><Input id="primaryContactEmail" name="primaryContactEmail" type="email" defaultValue={initial.primaryContactEmail ?? ""} /><FieldError errors={state.fieldErrors?.primaryContactEmail} /></div><div className="grid gap-2"><Label htmlFor="deploymentProjectId">Dağıtım proje kimliği</Label><Input id="deploymentProjectId" name="deploymentProjectId" defaultValue={initial.deploymentProjectId ?? ""} /></div><div className="grid gap-2"><Label htmlFor="managementEndpoint">Güvenli yönetim uç noktası</Label><Input id="managementEndpoint" name="managementEndpoint" type="url" placeholder="https://..." defaultValue={initial.managementEndpoint ?? ""} /><FieldError errors={state.fieldErrors?.managementEndpoint} /></div></section>
      </div>
      <VisualPreview name={name} theme={theme} font={font} primary={primary} accent={accent} hero={hero} focalX={focal.x} focalY={focal.y} />
    </div>
    <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur"><Button type="submit" size="lg" disabled={pending}>{pending ? "Kaydediliyor…" : initial.id ? "Site görünümünü uygula" : "Kurulum kaydını oluştur"}</Button></div>
  </form>;
}
