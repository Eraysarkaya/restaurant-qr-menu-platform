import "server-only";
import type { Prisma } from "@/generated/prisma/client";

export type InstanceAppearance = {
  templatePreset: "WARM" | "MODERN" | "CLASSIC";
  fontPreset: "MANROPE" | "LORA";
  featurePreset: "QR_MENU_ONLY" | "RESTAURANT_WEBSITE" | "PREMIUM_WEBSITE";
  logoUrl: string | null;
  logoPublicId: string | null;
  heroImageUrl: string | null;
  heroImagePublicId: string | null;
  heroFocalX: number;
  heroFocalY: number;
  primaryColor: string;
  accentColor: string;
  ownerCanEditBranding: boolean;
  showHomePage: boolean;
  showAboutPage: boolean;
  showContactPage: boolean;
  showHero: boolean;
  showFeaturedProducts: boolean;
  showMap: boolean;
  showSocialLinks: boolean;
};

export async function syncLocalInstanceSettings(transaction: Prisma.TransactionClient, data: InstanceAppearance) {
  await transaction.restaurantSettings.update({ where: { id: "singleton" }, data: {
    themePreset: data.templatePreset, fontPreset: data.fontPreset, featurePreset: data.featurePreset,
    logoUrl: data.logoUrl, logoPublicId: data.logoPublicId, heroImageUrl: data.heroImageUrl, heroImagePublicId: data.heroImagePublicId,
    heroFocalX: data.heroFocalX, heroFocalY: data.heroFocalY, primaryColor: data.primaryColor, accentColor: data.accentColor,
    ownerCanEditBranding: data.ownerCanEditBranding, showHomePage: data.showHomePage, showAboutPage: data.showAboutPage,
    showContactPage: data.showContactPage, showHero: data.showHero, showFeaturedProducts: data.showFeaturedProducts,
    showMap: data.showMap, showSocialLinks: data.showSocialLinks,
  } });
}
