import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/lib/constants";

export function formatPrice(
  value: number | string,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugifyTurkish(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeWhatsAppNumber(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}
