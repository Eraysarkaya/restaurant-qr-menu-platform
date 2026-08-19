import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicSettings } from "@/server/dal/public";
import { getPublicTheme, type PublicFontPreset, type PublicThemePreset } from "@/lib/public-theme";
import { appUrl } from "@/server/env";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  if (!settings) return {};
  return {
    metadataBase: new URL(appUrl()),
    title: { default: settings.name, template: `%s | ${settings.name}` },
    description: settings.shortDescription,
    openGraph: {
      type: "website",
      locale: settings.locale.replace("-", "_"),
      siteName: settings.name,
      title: settings.name,
      description: settings.shortDescription,
      images: settings.heroImageUrl ? [{ url: settings.heroImageUrl, alt: `${settings.name} sofrası` }] : undefined,
    },
    twitter: { card: "summary_large_image", title: settings.name, description: settings.shortDescription },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const settings = await getPublicSettings();
  if (!settings) return <main id="main-content" className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="font-heading text-4xl font-bold">Kurulum tamamlanmak üzere</h1><p className="mt-3 text-muted-foreground">Veritabanı migration ve seed adımlarını çalıştırın.</p></div></main>;
  const preset = settings.themePreset as PublicThemePreset;
  const style = getPublicTheme(preset, settings.primaryColor, settings.accentColor, settings.fontPreset as PublicFontPreset) as CSSProperties;
  return <div style={style} data-theme={preset} className="public-site flex min-h-screen flex-col"><PublicHeader name={settings.name} logoUrl={settings.logoUrl} phone={settings.phone} whatsapp={settings.whatsapp} showPhoneCta={settings.showPhoneCta} showWhatsappCta={settings.showWhatsappCta} showAboutPage={settings.showAboutPage} showContactPage={settings.showContactPage} /><main id="main-content" className="flex-1">{children}</main><PublicFooter {...settings} /></div>;
}
