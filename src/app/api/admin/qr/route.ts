import QRCode from "qrcode";
import { requireStaffAction } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { appUrl } from "@/server/env";
import { buildMenuUrl, qrFileName } from "@/lib/qr";

export async function GET(request: Request) {
  try { await requireStaffAction("ADMIN_ACCESS"); } catch { return Response.json({ error: "Yetkisiz erişim." }, { status: 401 }); }
  const format = new URL(request.url).searchParams.get("format") === "svg" ? "svg" : "png";
  const settings = await getDb().restaurantSettings.findUnique({ where: { id: "singleton" }, select: { name: true } });
  if (!settings) return Response.json({ error: "İşletme ayarları bulunamadı." }, { status: 404 });
  const menuUrl = buildMenuUrl(appUrl());
  if (format === "svg") { const svg = await QRCode.toString(menuUrl, { type: "svg", width: 1024, margin: 3, errorCorrectionLevel: "H", color: { dark: "#1d211f", light: "#ffffff" } }); return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "content-disposition": `attachment; filename="${qrFileName(settings.name, "svg")}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } }); }
  const png = await QRCode.toBuffer(menuUrl, { width: 1024, margin: 3, errorCorrectionLevel: "H", color: { dark: "#1d211f", light: "#ffffff" } });
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png", "content-disposition": `attachment; filename="${qrFileName(settings.name, "png")}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
}
