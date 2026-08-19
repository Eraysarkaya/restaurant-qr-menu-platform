import { describe, expect, it } from "vitest";
import { formatPrice, sanitizeWhatsAppNumber, slugifyTurkish } from "@/lib/format";

describe("Türkçe biçimlendirme yardımcıları", () => {
  it("Türkçe karakterleri URL uyumlu slug'a dönüştürür", () => {
    expect(slugifyTurkish("  Izgara Köfte & Çıtır Patates  ")).toBe("izgara-kofte-citir-patates");
  });

  it("ondalıklı fiyatı TRY olarak gösterir", () => {
    expect(formatPrice("249.90")).toMatch(/(?:₺\s*249,90|249,90\s*₺)/);
  });

  it("WhatsApp numarasından biçim karakterlerini temizler", () => {
    expect(sanitizeWhatsAppNumber("+90 (555) 123-45-67")).toBe("905551234567");
  });
});
