-- This project no longer provides checkout, payment, table-ordering or kitchen-operation features.
-- The removed rows in these tables belong to the retired demo module.

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_kitchenStationId_fkey";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "kitchenStationId";

DROP TABLE IF EXISTS "PaymentRefund";
DROP TABLE IF EXISTS "PaymentEvent";
DROP TABLE IF EXISTS "Payment";
DROP TABLE IF EXISTS "OrderItemProductionHistory";
DROP TABLE IF EXISTS "OrderItemOption";
DROP TABLE IF EXISTS "OrderStatusHistory";
DROP TABLE IF EXISTS "DeliveryAddress";
DROP TABLE IF EXISTS "OrderItem";
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS "StaffKitchenStation";
DROP TABLE IF EXISTS "ProductOption";
DROP TABLE IF EXISTS "ProductOptionGroup";
DROP TABLE IF EXISTS "RestaurantOrderSettings";
DROP TABLE IF EXISTS "DiningTable";
DROP TABLE IF EXISTS "DeliveryZone";
DROP TABLE IF EXISTS "KitchenStation";

DROP TYPE IF EXISTS "ProductionStatus";
DROP TYPE IF EXISTS "OrderType";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "PaymentMethod";
DROP TYPE IF EXISTS "PaymentProviderKind";
DROP TYPE IF EXISTS "RefundStatus";

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
CREATE TYPE "UserRole_new" AS ENUM ('OWNER', 'EDITOR');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new"
USING (CASE WHEN "role"::text = 'OWNER' THEN 'OWNER' ELSE 'EDITOR' END)::"UserRole_new";
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'OWNER';

DELETE FROM "LegalDocument"
WHERE "type"::text IN ('DISTANCE_SALES', 'PAYMENT_TERMS', 'CANCELLATION_REFUND');
ALTER TABLE "LegalDocument" ALTER COLUMN "type" DROP DEFAULT;
CREATE TYPE "LegalDocumentType_new" AS ENUM ('PRIVACY', 'KVKK', 'COOKIE');
ALTER TABLE "LegalDocument" ALTER COLUMN "type" TYPE "LegalDocumentType_new"
USING ("type"::text::"LegalDocumentType_new");
DROP TYPE "LegalDocumentType";
ALTER TYPE "LegalDocumentType_new" RENAME TO "LegalDocumentType";

CREATE TYPE "PublicFontPreset" AS ENUM ('MANROPE', 'LORA');
ALTER TABLE "RestaurantSettings"
  ADD COLUMN "fontPreset" "PublicFontPreset" NOT NULL DEFAULT 'LORA',
  DROP COLUMN IF EXISTS "showProductWhatsappCta",
  DROP COLUMN IF EXISTS "setupCompleted",
  DROP COLUMN IF EXISTS "businessDayStart";

ALTER TABLE "RestaurantInstance"
  ADD COLUMN "fontPreset" "PublicFontPreset" NOT NULL DEFAULT 'LORA',
  ADD COLUMN "heroImageUrl" TEXT,
  ADD COLUMN "heroFocalX" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "heroFocalY" INTEGER NOT NULL DEFAULT 50;

UPDATE "RestaurantInstance" AS instance
SET
  "logoUrl" = settings."logoUrl",
  "heroImageUrl" = settings."heroImageUrl",
  "heroFocalX" = settings."heroFocalX",
  "heroFocalY" = settings."heroFocalY",
  "primaryColor" = settings."primaryColor",
  "accentColor" = settings."accentColor"
FROM "RestaurantSettings" AS settings
WHERE instance."deploymentProjectId" = 'local' AND settings."id" = 'singleton';

CREATE INDEX "Category_updatedAt_idx" ON "Category"("updatedAt");
