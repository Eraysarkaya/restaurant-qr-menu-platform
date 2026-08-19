import { describe, expect, it } from "vitest";
import { normalizeInstanceCapabilities } from "@/lib/instance-capabilities";

const base = {
  featurePreset: "RESTAURANT_WEBSITE" as const,
  showHomePage: true,
  showAboutPage: true,
  showContactPage: true,
  showHero: true,
  showFeaturedProducts: true,
};

describe("kurulum yetenekleri", () => {
  it("web sitesi paketindeki görünür bölümleri korur", () => {
    expect(normalizeInstanceCapabilities(base)).toEqual(base);
  });

  it("yalnız QR menü paketinde web sayfalarını sunucu tarafında kapatır", () => {
    expect(normalizeInstanceCapabilities({ ...base, featurePreset: "QR_MENU_ONLY" })).toMatchObject({
      showHomePage: false,
      showAboutPage: false,
      showContactPage: false,
      showHero: false,
      showFeaturedProducts: false,
    });
  });
});
