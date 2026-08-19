CREATE TYPE "PublicThemePreset" AS ENUM ('WARM', 'MODERN', 'CLASSIC');

ALTER TABLE "RestaurantSettings"
ADD COLUMN "themePreset" "PublicThemePreset" NOT NULL DEFAULT 'WARM',
ADD COLUMN "heroFocalX" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "heroFocalY" INTEGER NOT NULL DEFAULT 50;

ALTER TABLE "RestaurantSettings"
ADD CONSTRAINT "RestaurantSettings_heroFocalX_check" CHECK ("heroFocalX" BETWEEN 0 AND 100),
ADD CONSTRAINT "RestaurantSettings_heroFocalY_check" CHECK ("heroFocalY" BETWEEN 0 AND 100);
