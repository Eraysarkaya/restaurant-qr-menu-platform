import type { MetadataRoute } from "next";
import { getPublicSettings } from "@/server/dal/public";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getPublicSettings();
  const name = settings?.name ?? "Restoran";
  return {
    name,
    short_name: name.slice(0, 30),
    description: settings?.shortDescription ?? `${name} restoran web sitesi ve güncel menüsü`,
    start_url: "/",
    display: "standalone",
    background_color: "#F5EFE5",
    theme_color: settings?.primaryColor ?? "#B4532A",
    lang: settings?.locale ?? "tr-TR",
  };
}
