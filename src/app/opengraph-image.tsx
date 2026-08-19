import { ImageResponse } from "next/og";
import { getPublicSettings } from "@/server/dal/public";

export const alt = "Restoran web sitesi ve güncel menü";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const settings = await getPublicSettings();
  const name = settings?.name ?? "Restoran";
  const primary = settings?.primaryColor ?? "#b4532a";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#f6f0e7", background: "linear-gradient(135deg, #171512 0%, #4b382b 55%, #9a4528 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32 }}><div style={{ width: 54, height: 54, borderRadius: 999, background: primary, display: "flex", alignItems: "center", justifyContent: "center" }}>{name.slice(0, 1)}</div>{name}</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}><div style={{ fontSize: 78, lineHeight: 1.05, fontWeight: 700 }}>{settings?.heroTitle ?? "İyi yemek, sıcak bir masa."}</div><div style={{ marginTop: 28, fontSize: 30, color: "#e4d8c7" }}>{settings?.heroSubtitle ?? settings?.shortDescription}</div></div>
    </div>,
    size,
  );
}
