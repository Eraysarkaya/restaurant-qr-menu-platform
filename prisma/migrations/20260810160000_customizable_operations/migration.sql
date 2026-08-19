-- Additive and retry-safe migration: existing restaurant, users, products and orders are preserved.
DO $$ BEGIN CREATE TYPE "BusinessType" AS ENUM ('CAFE', 'LOKANTA', 'QUICK_SERVICE', 'RESTAURANT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ProductionStatus" AS ENUM ('WAITING', 'PREPARING', 'READY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "RestaurantSettings"
  ADD COLUMN IF NOT EXISTS "businessType" "BusinessType" NOT NULL DEFAULT 'LOKANTA',
  ADD COLUMN IF NOT EXISTS "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "businessDayStart" TEXT NOT NULL DEFAULT '04:00',
  ADD COLUMN IF NOT EXISTS "largeTextMode" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "RestaurantOrderSettings"
  ADD COLUMN IF NOT EXISTS "kitchenStationsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "kitchenShowImages" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "kitchenSoundEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "kitchenHighContrast" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "kitchenWarningMinutes" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "kitchenCriticalMinutes" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS "completedRecallMinutes" INTEGER NOT NULL DEFAULT 30;

CREATE TABLE IF NOT EXISTS "KitchenStation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#B4532A',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "targetMinutes" INTEGER NOT NULL DEFAULT 15,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KitchenStation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "KitchenStation_name_key" ON "KitchenStation"("name");
CREATE INDEX IF NOT EXISTS "KitchenStation_isActive_sortOrder_idx" ON "KitchenStation"("isActive", "sortOrder");

INSERT INTO "KitchenStation" ("id", "name", "sortOrder", "targetMinutes", "isActive", "isDefault", "updatedAt")
VALUES ('default-kitchen-station', 'Ana Mutfak', 0, 15, true, true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "kitchenStationId" TEXT;
UPDATE "Product" SET "kitchenStationId" = 'default-kitchen-station' WHERE "kitchenStationId" IS NULL;
CREATE INDEX IF NOT EXISTS "Product_kitchenStationId_isAvailable_archivedAt_idx" ON "Product"("kitchenStationId", "isAvailable", "archivedAt");
DO $$ BEGIN ALTER TABLE "Product" ADD CONSTRAINT "Product_kitchenStationId_fkey" FOREIGN KEY ("kitchenStationId") REFERENCES "KitchenStation"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "StaffKitchenStation" (
  "userId" TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffKitchenStation_pkey" PRIMARY KEY ("userId", "stationId")
);
CREATE INDEX IF NOT EXISTS "StaffKitchenStation_stationId_userId_idx" ON "StaffKitchenStation"("stationId", "userId");
DO $$ BEGIN ALTER TABLE "StaffKitchenStation" ADD CONSTRAINT "StaffKitchenStation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StaffKitchenStation" ADD CONSTRAINT "StaffKitchenStation_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "KitchenStation"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "productImageSnapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "stationIdSnapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "stationNameSnapshot" TEXT NOT NULL DEFAULT 'Ana Mutfak',
  ADD COLUMN IF NOT EXISTS "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'WAITING',
  ADD COLUMN IF NOT EXISTS "productionVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "productionStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "productionReadyAt" TIMESTAMP(3);

UPDATE "OrderItem" oi
SET "productImageSnapshot" = (SELECT p."imageUrl" FROM "Product" p WHERE p."id" = oi."productId"),
    "stationIdSnapshot" = COALESCE((SELECT p."kitchenStationId" FROM "Product" p WHERE p."id" = oi."productId"), 'default-kitchen-station'),
    "stationNameSnapshot" = COALESCE((SELECT ks."name" FROM "Product" p LEFT JOIN "KitchenStation" ks ON ks."id" = p."kitchenStationId" WHERE p."id" = oi."productId"), 'Ana Mutfak'),
    "productionStatus" = CASE
      WHEN o."status" IN ('READY', 'SERVED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED') THEN 'READY'::"ProductionStatus"
      WHEN o."status" IN ('ACCEPTED', 'PREPARING') THEN 'PREPARING'::"ProductionStatus"
      ELSE 'WAITING'::"ProductionStatus"
    END,
    "productionStartedAt" = o."preparingAt",
    "productionReadyAt" = o."readyAt"
FROM "Order" o
WHERE o."id" = oi."orderId";

CREATE INDEX IF NOT EXISTS "OrderItem_stationIdSnapshot_productionStatus_updatedAt_idx" ON "OrderItem"("stationIdSnapshot", "productionStatus", "updatedAt");
DO $$ BEGIN ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_stationIdSnapshot_fkey" FOREIGN KEY ("stationIdSnapshot") REFERENCES "KitchenStation"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "OrderItemProductionHistory" (
  "id" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "stationId" TEXT,
  "actorId" TEXT,
  "fromStatus" "ProductionStatus" NOT NULL,
  "toStatus" "ProductionStatus" NOT NULL,
  "version" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItemProductionHistory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "OrderItemProductionHistory_orderItemId_version_key" ON "OrderItemProductionHistory"("orderItemId", "version");
CREATE INDEX IF NOT EXISTS "OrderItemProductionHistory_stationId_createdAt_idx" ON "OrderItemProductionHistory"("stationId", "createdAt");
CREATE INDEX IF NOT EXISTS "OrderItemProductionHistory_actorId_createdAt_idx" ON "OrderItemProductionHistory"("actorId", "createdAt");
DO $$ BEGIN ALTER TABLE "OrderItemProductionHistory" ADD CONSTRAINT "OrderItemProductionHistory_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "OrderItemProductionHistory" ADD CONSTRAINT "OrderItemProductionHistory_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "KitchenStation"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "OrderItemProductionHistory" ADD CONSTRAINT "OrderItemProductionHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
