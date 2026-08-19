export type InstanceCapabilities = {
  featurePreset: "QR_MENU_ONLY" | "RESTAURANT_WEBSITE" | "PREMIUM_WEBSITE";
  showHomePage: boolean;
  showAboutPage: boolean;
  showContactPage: boolean;
  showHero: boolean;
  showFeaturedProducts: boolean;
};

export function normalizeInstanceCapabilities<T extends InstanceCapabilities>(data: T): T {
  if (data.featurePreset !== "QR_MENU_ONLY") return data;
  return {
    ...data,
    showHomePage: false,
    showAboutPage: false,
    showContactPage: false,
    showHero: false,
    showFeaturedProducts: false,
  };
}
