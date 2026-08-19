export const PUBLIC_THEME_PRESETS = {
  WARM: {
    label: "Sıcak",
    description: "Samimi, yumuşak ve iştah açıcı",
    background: "#FAF8F4",
    foreground: "#211F1C",
    card: "#FFFFFF",
    secondary: "#F3EFE8",
    mutedForeground: "#6D675F",
    border: "#E5DED4",
    radius: "0.9rem",
    headingFont: "var(--font-lora)",
    shadow: "0 16px 42px rgb(48 35 24 / 0.09)",
  },
  MODERN: {
    label: "Modern",
    description: "Net, ferah ve çağdaş",
    background: "#F7F7F5",
    foreground: "#171816",
    card: "#FFFFFF",
    secondary: "#ECEDEA",
    mutedForeground: "#62655F",
    border: "#DCDDDA",
    radius: "0.45rem",
    headingFont: "var(--font-manrope)",
    shadow: "none",
  },
  CLASSIC: {
    label: "Klasik",
    description: "Zarif, ölçülü ve zamansız",
    background: "#FBF8F0",
    foreground: "#201D18",
    card: "#FFFEFA",
    secondary: "#F1EBDD",
    mutedForeground: "#6B6358",
    border: "#DCD2BF",
    radius: "0.25rem",
    headingFont: "var(--font-lora)",
    shadow: "0 12px 30px rgb(46 36 24 / 0.06)",
  },
} as const;

export type PublicThemePreset = keyof typeof PUBLIC_THEME_PRESETS;
export type PublicFontPreset = "MANROPE" | "LORA";

function hexToRgb(hex: string) {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#211f1c";
  return {
    r: Number.parseInt(safe.slice(1, 3), 16),
    g: Number.parseInt(safe.slice(3, 5), 16),
    b: Number.parseInt(safe.slice(5, 7), 16),
  };
}

function channelLuminance(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(first: string, second: string) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

export function accessibleForeground(background: string) {
  return contrastRatio(background, "#FFFFFF") >= contrastRatio(background, "#111111") ? "#FFFFFF" : "#111111";
}

export function normalizeFocalPoint(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function getPublicTheme(preset: PublicThemePreset, primary: string, accent: string, fontPreset?: PublicFontPreset) {
  const theme = PUBLIC_THEME_PRESETS[preset] ?? PUBLIC_THEME_PRESETS.WARM;
  return {
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--card": theme.card,
    "--card-foreground": theme.foreground,
    "--popover": theme.card,
    "--popover-foreground": theme.foreground,
    "--primary": primary,
    "--primary-foreground": accessibleForeground(primary),
    "--secondary": theme.secondary,
    "--secondary-foreground": theme.foreground,
    "--muted": theme.secondary,
    "--muted-foreground": theme.mutedForeground,
    "--accent": accent,
    "--accent-foreground": accessibleForeground(accent),
    "--border": theme.border,
    "--input": theme.border,
    "--ring": primary,
    "--radius": theme.radius,
    "--brand-primary": primary,
    "--brand-primary-foreground": accessibleForeground(primary),
    "--brand-accent": accent,
    "--brand-accent-foreground": accessibleForeground(accent),
    "--public-heading-font": fontPreset ? (fontPreset === "LORA" ? "var(--font-lora)" : "var(--font-manrope)") : theme.headingFont,
    "--public-card-shadow": theme.shadow,
  } as const;
}
