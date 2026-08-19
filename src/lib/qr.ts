export function buildMenuUrl(baseUrl: string) {
  const url = new URL(baseUrl);
  url.pathname = "/menu";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function qrFileName(name: string, extension: "png" | "svg") {
  const safe = slugifyTurkish(name) || "menu";
  return `${safe}-menu-qr.${extension}`;
}
import { slugifyTurkish } from "@/lib/format";
