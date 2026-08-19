import { describe, expect, it } from "vitest";
import { accessibleForeground, contrastRatio, getPublicTheme, normalizeFocalPoint, PUBLIC_THEME_PRESETS } from "@/lib/public-theme";

describe("public tema sistemi", () => {
  it("üç kontrollü görünüm presetini sunar", () => {
    expect(Object.keys(PUBLIC_THEME_PRESETS)).toEqual(["WARM", "MODERN", "CLASSIC"]);
    expect(PUBLIC_THEME_PRESETS.MODERN.headingFont).toContain("manrope");
    expect(PUBLIC_THEME_PRESETS.WARM.headingFont).toContain("lora");
  });

  it.each(["#FFFFFF", "#B4532A", "#66704A", "#F5D90A", "#111111"])("%s üzerinde WCAG AA buton metni üretir", (background) => {
    expect(contrastRatio(background, accessibleForeground(background))).toBeGreaterThanOrEqual(4.5);
  });

  it("işletme rengini preset yüzeylerinin üzerinde korur", () => {
    const theme = getPublicTheme("CLASSIC", "#7B2D26", "#4E6543");
    expect(theme["--primary"]).toBe("#7B2D26");
    expect(theme["--background"]).toBe(PUBLIC_THEME_PRESETS.CLASSIC.background);
  });

  it("görsel odak değerlerini güvenli aralığa çeker", () => {
    expect(normalizeFocalPoint(-20)).toBe(0);
    expect(normalizeFocalPoint(54.6)).toBe(55);
    expect(normalizeFocalPoint(150)).toBe(100);
    expect(normalizeFocalPoint(Number.NaN)).toBe(50);
  });
});
