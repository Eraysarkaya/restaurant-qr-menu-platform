"use client";

import { useActionState, useState, type CSSProperties } from "react";
import { Check, Crosshair } from "lucide-react";
import { saveSettingsAction } from "@/features/admin/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { getPublicTheme, PUBLIC_THEME_PRESETS, type PublicFontPreset, type PublicThemePreset } from "@/lib/public-theme";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageInput } from "@/components/admin/image-input";
import { RestaurantImage } from "@/components/public/restaurant-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SettingsInitial = Record<string, string | number | boolean | null | undefined> & {
  logoUrl?: string | null;
  heroImageUrl?: string | null;
};

type PreviewState = {
  preset: PublicThemePreset;
  font: PublicFontPreset;
  primary: string;
  accent: string;
  focalX: number;
  focalY: number;
  title: string;
  subtitle: string;
};

const FOCAL_POINTS = [
  [0, 0], [50, 0], [100, 0],
  [0, 50], [50, 50], [100, 50],
  [0, 100], [50, 100], [100, 100],
] as const;

function TextField({ name, label, initial, type = "text", maxLength, onChange }: { name: string; label: string; initial: SettingsInitial; type?: string; maxLength?: number; onChange?: (value: string) => void }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={String(initial[name] ?? "")} maxLength={maxLength} onChange={onChange ? (event) => onChange(event.target.value) : undefined} /></div>;
}

function CtaCheckbox({ name, label, initial }: { name: string; label: string; initial: SettingsInitial }) {
  return <label className="flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm font-medium"><input type="checkbox" name={name} defaultChecked={Boolean(initial[name])} className="size-4 accent-primary" />{label}</label>;
}

function ThemeChoice({ value, selected, onSelect }: { value: PublicThemePreset; selected: boolean; onSelect: (value: PublicThemePreset) => void }) {
  const preset = PUBLIC_THEME_PRESETS[value];
  return <label className={`relative cursor-pointer rounded-xl border-2 p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/35"}`}>
    <input type="radio" name="themePreset" value={value} checked={selected} onChange={() => onSelect(value)} className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
    <span className="mb-3 grid h-20 grid-cols-[.7fr_1.3fr] overflow-hidden rounded-lg border bg-white" aria-hidden="true">
      <span className="bg-[var(--sample-surface)] p-2" style={{ "--sample-surface": preset.secondary } as CSSProperties}><span className="block h-2 w-8 rounded-full bg-primary/75" /></span>
      <span className="p-2"><span className="block h-2 w-10 rounded-full bg-foreground/75" /><span className="mt-2 block h-1.5 w-full rounded-full bg-muted" /><span className="mt-1 block h-1.5 w-3/4 rounded-full bg-muted" /></span>
    </span>
    <span className="flex items-center justify-between gap-2"><strong>{preset.label}</strong>{selected ? <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" /></span> : null}</span>
    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{preset.description}</span>
  </label>;
}

function FocalPicker({ x, y, onChange }: { x: number; y: number; onChange: (x: number, y: number) => void }) {
  return <div className="grid gap-2">
    <Label>Görsel odağı</Label>
    <div className="grid w-40 grid-cols-3 gap-1 rounded-xl border bg-secondary p-2" role="group" aria-label="Hero görseli odak noktası">
      {FOCAL_POINTS.map(([pointX, pointY]) => {
        const selected = x === pointX && y === pointY;
        return <button key={`${pointX}-${pointY}`} type="button" onClick={() => onChange(pointX, pointY)} aria-label={`Görsel odağı yüzde ${pointX} yatay, yüzde ${pointY} dikey`} aria-pressed={selected} className={`grid size-10 place-items-center rounded-lg border transition ${selected ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50"}`}><Crosshair className="size-4" /></button>;
      })}
    </div>
    <p className="text-sm text-muted-foreground">Fotoğrafta görünür kalmasını istediğiniz bölgeyi seçin.</p>
  </div>;
}

function ThemePreview({ state, imageUrl, name }: { state: PreviewState; imageUrl?: string | null; name: string }) {
  const style = getPublicTheme(state.preset, state.primary, state.accent, state.font) as CSSProperties;
  return <div className="grid gap-3 xl:sticky xl:top-24">
    <div>
      <p className="text-sm font-semibold">Canlı önizleme</p>
      <p className="text-xs text-muted-foreground">Masaüstü ve telefon görünümü</p>
    </div>
    <div style={style} data-theme={state.preset} className="public-site overflow-hidden rounded-xl border bg-background shadow-lg">
      <div className="flex h-9 items-center justify-between border-b bg-background px-3 text-[9px] font-bold"><span>{name}</span><span>Menü · İletişim</span></div>
      <div className="relative h-52 bg-[#211f1c] text-white">
        <RestaurantImage src={imageUrl ?? "/demo/restaurant-interior-v2.png"} alt="Masaüstü site önizlemesi" fill sizes="420px" className="object-cover" style={{ objectPosition: `${state.focalX}% ${state.focalY}%` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4"><span className="text-[9px] font-bold text-emerald-200">● Şu anda açık</span><p className="mt-1 line-clamp-2 font-heading text-xl font-semibold leading-tight">{state.title}</p><p className="mt-1 line-clamp-2 max-w-64 text-[9px] leading-4 text-white/80">{state.subtitle}</p><span className="mt-2 inline-flex rounded-md bg-primary px-3 py-1.5 text-[9px] font-bold text-primary-foreground">Menüyü gör</span></div>
      </div>
    </div>
    <div style={style} data-theme={state.preset} className="public-site mx-auto w-44 overflow-hidden rounded-[1.35rem] border-[5px] border-[#242424] bg-background shadow-lg">
      <div className="flex h-7 items-center justify-between bg-background px-2 text-[7px] font-bold"><span className="max-w-20 truncate">{name}</span><span>☰</span></div>
      <div className="relative h-64 bg-[#211f1c] text-white">
        <RestaurantImage src={imageUrl ?? "/demo/restaurant-interior-v2.png"} alt="Telefon site önizlemesi" fill sizes="176px" className="object-cover" style={{ objectPosition: `${state.focalX}% ${state.focalY}%` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-3"><span className="text-[7px] font-bold text-emerald-200">● Şu anda açık</span><p className="mt-1 line-clamp-2 font-heading text-base font-semibold leading-tight">{state.title}</p><p className="mt-1 line-clamp-3 text-[7px] leading-3 text-white/80">{state.subtitle}</p><span className="mt-2 inline-flex rounded bg-primary px-2 py-1 text-[7px] font-bold text-primary-foreground">Menüyü gör</span></div>
      </div>
    </div>
  </div>;
}

export function SettingsForm({ initial, canEditBranding }: { initial: SettingsInitial; canEditBranding: boolean }) {
  const [state, action] = useActionState(saveSettingsAction, INITIAL_ACTION_STATE);
  const [preview, setPreview] = useState<PreviewState>({
    preset: (initial.themePreset as PublicThemePreset) || "WARM",
    font: (initial.fontPreset as PublicFontPreset) || "LORA",
    primary: String(initial.primaryColor || "#B4532A"),
    accent: String(initial.accentColor || "#66704A"),
    focalX: Number(initial.heroFocalX ?? 50),
    focalY: Number(initial.heroFocalY ?? 50),
    title: String(initial.heroTitle || ""),
    subtitle: String(initial.heroSubtitle || ""),
  });
  const [heroPreview, setHeroPreview] = useState(String(initial.heroImageUrl ?? ""));

  return <form action={action} className="grid gap-6">
    <ActionFeedback state={state} />
    <Tabs defaultValue="content">
      <TabsList className="h-auto flex-wrap"><TabsTrigger value="content">İçerik</TabsTrigger>{canEditBranding ? <TabsTrigger value="appearance">Görünüm</TabsTrigger> : null}<TabsTrigger value="contact">İletişim</TabsTrigger><TabsTrigger value="social">Sosyal medya</TabsTrigger></TabsList>

      <TabsContent forceMount value="content" className="grid gap-5 rounded-xl border bg-card p-6 data-[state=inactive]:hidden">
        <TextField name="name" label="Restoran adı" initial={initial} maxLength={100} />
        <div className="grid gap-2"><Label htmlFor="shortDescription">Kısa açıklama</Label><Textarea id="shortDescription" name="shortDescription" defaultValue={String(initial.shortDescription ?? "")} rows={3} maxLength={220} required /><FieldError errors={state.fieldErrors?.shortDescription} /></div>
        <div className="grid gap-2"><Label htmlFor="longDescription">Hakkımızda metni</Label><Textarea id="longDescription" name="longDescription" defaultValue={String(initial.longDescription ?? "")} rows={8} maxLength={3000} required /></div>
        <TextField name="heroTitle" label="Ana sayfa başlığı" initial={initial} maxLength={120} onChange={(title) => setPreview((current) => ({ ...current, title }))} />
        <div className="grid gap-2"><Label htmlFor="heroSubtitle">Ana sayfa kısa açıklaması</Label><Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={String(initial.heroSubtitle ?? "")} rows={4} maxLength={260} required onChange={(event) => setPreview((current) => ({ ...current, subtitle: event.target.value }))} /></div>
        <div className="grid gap-5 sm:grid-cols-3"><TextField name="currency" label="Para birimi" initial={initial} /><TextField name="locale" label="Dil ve bölge" initial={initial} /><TextField name="timezone" label="Saat dilimi" initial={initial} /></div>
      </TabsContent>

      {canEditBranding ? <TabsContent forceMount value="appearance" className="data-[state=inactive]:hidden">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-6 rounded-xl border bg-card p-6">
            <fieldset className="grid gap-3"><legend className="mb-1 text-sm font-semibold">Hazır görünüm</legend><div className="grid gap-3 sm:grid-cols-3">{(Object.keys(PUBLIC_THEME_PRESETS) as PublicThemePreset[]).map((preset) => <ThemeChoice key={preset} value={preset} selected={preview.preset === preset} onSelect={(value) => setPreview((current) => ({ ...current, preset: value }))} />)}</div></fieldset>
            <fieldset className="grid gap-3"><legend className="text-sm font-semibold">Başlık yazı stili</legend><div className="grid gap-3 sm:grid-cols-2">{([['LORA', 'Yumuşak ve geleneksel'], ['MANROPE', 'Sade ve modern']] as const).map(([value, label]) => <label key={value} className={`flex min-h-14 cursor-pointer items-center justify-between rounded-xl border-2 px-4 ${preview.font === value ? 'border-primary bg-primary/5' : 'border-border'}`}><span className={value === 'LORA' ? 'font-[var(--font-lora)]' : 'font-[var(--font-manrope)]'}>{label}</span><input type="radio" name="fontPreset" value={value} checked={preview.font === value} onChange={() => setPreview((current) => ({ ...current, font: value }))} className="size-4 accent-primary" /></label>)}</div></fieldset>
            <div className="grid gap-5 sm:grid-cols-2"><TextField name="primaryColor" label="Ana marka rengi" type="color" initial={initial} onChange={(primary) => setPreview((current) => ({ ...current, primary }))} /><TextField name="accentColor" label="İkincil marka rengi" type="color" initial={initial} onChange={(accent) => setPreview((current) => ({ ...current, accent }))} /></div>
            <ImageInput name="logo" label="Logo" currentUrl={initial.logoUrl} removeName="removeLogo" aspectClass="aspect-square max-w-40" imageClassName="object-contain p-2" />
            <ImageInput name="heroImage" label="Ana sayfa görseli" currentUrl={initial.heroImageUrl} removeName="removeHeroImage" aspectClass="aspect-video max-w-2xl" onPreviewChange={setHeroPreview} />
            <input type="hidden" name="heroFocalX" value={preview.focalX} />
            <input type="hidden" name="heroFocalY" value={preview.focalY} />
            <FocalPicker x={preview.focalX} y={preview.focalY} onChange={(focalX, focalY) => setPreview((current) => ({ ...current, focalX, focalY }))} />
          </div>
          <ThemePreview state={preview} imageUrl={heroPreview} name={String(initial.name ?? "Restoran")} />
        </div>
      </TabsContent> : <><input type="hidden" name="themePreset" value={preview.preset} /><input type="hidden" name="fontPreset" value={preview.font} /><input type="hidden" name="primaryColor" value={preview.primary} /><input type="hidden" name="accentColor" value={preview.accent} /><input type="hidden" name="heroFocalX" value={preview.focalX} /><input type="hidden" name="heroFocalY" value={preview.focalY} /></>}

      <TabsContent forceMount value="contact" className="grid gap-5 rounded-xl border bg-card p-6 data-[state=inactive]:hidden">
        <div className="grid gap-5 md:grid-cols-2"><TextField name="phone" label="Telefon" initial={initial} /><TextField name="whatsapp" label="WhatsApp iletişim numarası" initial={initial} /><TextField name="email" label="E-posta" type="email" initial={initial} /><TextField name="googleMapsUrl" label="Google Maps yol tarifi URL’si" type="url" initial={initial} /></div>
        <div className="grid gap-2"><Label htmlFor="address">Adres</Label><Textarea id="address" name="address" defaultValue={String(initial.address ?? "")} rows={4} /></div>
        <TextField name="mapEmbedUrl" label="Google Maps gömme bağlantısı" type="url" initial={initial} />
        <div className="grid gap-3 sm:grid-cols-3"><CtaCheckbox name="showPhoneCta" label="Telefonu göster" initial={initial} /><CtaCheckbox name="showWhatsappCta" label="WhatsApp iletişimini göster" initial={initial} /><CtaCheckbox name="showDirectionsCta" label="Yol tarifini göster" initial={initial} /></div>
      </TabsContent>

      <TabsContent forceMount value="social" className="grid gap-5 rounded-xl border bg-card p-6 data-[state=inactive]:hidden">
        <div className="grid gap-5 md:grid-cols-2"><TextField name="instagramUrl" label="Instagram URL" type="url" initial={initial} /><TextField name="facebookUrl" label="Facebook URL" type="url" initial={initial} /><TextField name="tiktokUrl" label="TikTok URL" type="url" initial={initial} /><TextField name="youtubeUrl" label="YouTube URL" type="url" initial={initial} /><TextField name="xUrl" label="X URL" type="url" initial={initial} /></div>
      </TabsContent>
    </Tabs>
    <div className="sticky bottom-4 z-20 flex justify-end rounded-xl border bg-background/92 p-4 shadow-lg backdrop-blur"><SubmitButton>Ayarları kaydet</SubmitButton></div>
  </form>;
}
