-- Mirror safe, non-secret capabilities in the developer control plane.
ALTER TABLE "RestaurantInstance"
  ADD COLUMN "ownerCanEditBranding" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "showHomePage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showAboutPage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showContactPage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showHero" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showFeaturedProducts" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showMap" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showSocialLinks" BOOLEAN NOT NULL DEFAULT true;
