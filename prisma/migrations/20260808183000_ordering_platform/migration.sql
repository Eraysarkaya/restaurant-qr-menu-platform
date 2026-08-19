-- Expand the existing CMS without resetting production data.
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'DELIVERY');
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_PAYMENT', 'PAYMENT_FAILED', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE_CARD');
CREATE TYPE "PaymentProviderKind" AS ENUM ('PAYTR');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');
CREATE TYPE "LegalDocumentType" AS ENUM ('PRIVACY', 'KVKK', 'COOKIE', 'DISTANCE_SALES', 'PAYMENT_TERMS', 'CANCELLATION_REFUND');

-- Preserve the original ADMIN user while moving to the staff-role model.
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('OWNER', 'MANAGER', 'KITCHEN', 'SERVICE', 'COURIER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new"
  USING ((CASE WHEN "role"::text = 'ADMIN' THEN 'OWNER' ELSE "role"::text END)::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'OWNER';
COMMIT;

DROP INDEX "Category_isActive_sortOrder_idx";
DROP INDEX "Product_categoryId_isActive_sortOrder_idx";
DROP INDEX "Product_isActive_isFeatured_sortOrder_idx";

ALTER TABLE "AuditLog" ADD COLUMN "metadata" JSONB;
ALTER TABLE "Category" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "RestaurantSettings" ALTER COLUMN "showProductWhatsappCta" SET DEFAULT false;
UPDATE "RestaurantSettings" SET "showProductWhatsappCta" = false;
ALTER TABLE "User"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "RestaurantOrderSettings" (
  "id" TEXT NOT NULL DEFAULT 'singleton',
  "dineInEnabled" BOOLEAN NOT NULL DEFAULT true,
  "deliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
  "maxLineQuantity" INTEGER NOT NULL DEFAULT 20,
  "maxCartLines" INTEGER NOT NULL DEFAULT 30,
  "maxCartItems" INTEGER NOT NULL DEFAULT 60,
  "maxDineInAmount" DECIMAL(10,2) NOT NULL DEFAULT 15000,
  "maxDeliveryAmount" DECIMAL(10,2) NOT NULL DEFAULT 10000,
  "productNoteMaxLength" INTEGER NOT NULL DEFAULT 200,
  "orderNoteMaxLength" INTEGER NOT NULL DEFAULT 500,
  "paymentTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RestaurantOrderSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductOptionGroup" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT false,
  "minSelect" INTEGER NOT NULL DEFAULT 0,
  "maxSelect" INTEGER NOT NULL DEFAULT 1,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductOptionGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductOption" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceDelta" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiningTable" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "qrToken" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiningTable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryZone" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "minimumOrder" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderNumber" SERIAL NOT NULL,
  "trackingTokenHash" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "cartFingerprint" TEXT NOT NULL,
  "type" "OrderType" NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "tableId" TEXT,
  "deliveryZoneId" TEXT,
  "courierId" TEXT,
  "customerName" TEXT,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "customerNote" TEXT,
  "internalNote" TEXT,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "version" INTEGER NOT NULL DEFAULT 0,
  "acceptedAt" TIMESTAMP(3),
  "preparingAt" TIMESTAMP(3),
  "readyAt" TIMESTAMP(3),
  "servedAt" TIMESTAMP(3),
  "outForDeliveryAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryAddress" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "addressLine" TEXT NOT NULL,
  "directions" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeliveryAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "productNameSnapshot" TEXT NOT NULL,
  "categoryNameSnapshot" TEXT NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "lineTotal" DECIMAL(10,2) NOT NULL,
  "customerNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItemOption" (
  "id" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "optionId" TEXT,
  "groupNameSnapshot" TEXT NOT NULL,
  "optionNameSnapshot" TEXT NOT NULL,
  "priceDelta" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderItemOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "fromStatus" "OrderStatus",
  "toStatus" "OrderStatus" NOT NULL,
  "actorId" TEXT,
  "note" TEXT,
  "version" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" "PaymentProviderKind" NOT NULL DEFAULT 'PAYTR',
  "method" "PaymentMethod" NOT NULL DEFAULT 'ONLINE_CARD',
  "merchantReference" TEXT NOT NULL,
  "providerReference" TEXT,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "testMode" BOOLEAN NOT NULL DEFAULT false,
  "failureCode" TEXT,
  "failureMessage" TEXT,
  "paidAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "providerStatus" TEXT NOT NULL,
  "amountMinor" INTEGER,
  "testMode" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentRefund" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "requestedById" TEXT,
  "providerReference" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "failureMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "PaymentRefund_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalDocument" (
  "id" TEXT NOT NULL,
  "type" "LegalDocumentType" NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductOptionGroup_productId_isActive_sortOrder_idx" ON "ProductOptionGroup"("productId", "isActive", "sortOrder");
CREATE INDEX "ProductOption_groupId_isActive_sortOrder_idx" ON "ProductOption"("groupId", "isActive", "sortOrder");
CREATE UNIQUE INDEX "DiningTable_label_key" ON "DiningTable"("label");
CREATE UNIQUE INDEX "DiningTable_qrToken_key" ON "DiningTable"("qrToken");
CREATE INDEX "DiningTable_isActive_sortOrder_idx" ON "DiningTable"("isActive", "sortOrder");
CREATE INDEX "DeliveryZone_isActive_sortOrder_idx" ON "DeliveryZone"("isActive", "sortOrder");
CREATE UNIQUE INDEX "DeliveryZone_district_neighborhood_key" ON "DeliveryZone"("district", "neighborhood");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_trackingTokenHash_key" ON "Order"("trackingTokenHash");
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE INDEX "Order_status_paymentStatus_updatedAt_idx" ON "Order"("status", "paymentStatus", "updatedAt");
CREATE INDEX "Order_type_status_createdAt_idx" ON "Order"("type", "status", "createdAt");
CREATE INDEX "Order_tableId_createdAt_idx" ON "Order"("tableId", "createdAt");
CREATE INDEX "Order_courierId_status_updatedAt_idx" ON "Order"("courierId", "status", "updatedAt");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE UNIQUE INDEX "DeliveryAddress_orderId_key" ON "DeliveryAddress"("orderId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_createdAt_idx" ON "OrderItem"("productId", "createdAt");
CREATE INDEX "OrderItemOption_orderItemId_idx" ON "OrderItemOption"("orderItemId");
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");
CREATE UNIQUE INDEX "OrderStatusHistory_orderId_version_key" ON "OrderStatusHistory"("orderId", "version");
CREATE UNIQUE INDEX "Payment_merchantReference_key" ON "Payment"("merchantReference");
CREATE INDEX "Payment_orderId_status_createdAt_idx" ON "Payment"("orderId", "status", "createdAt");
CREATE INDEX "Payment_status_updatedAt_idx" ON "Payment"("status", "updatedAt");
CREATE UNIQUE INDEX "PaymentEvent_eventKey_key" ON "PaymentEvent"("eventKey");
CREATE INDEX "PaymentEvent_paymentId_createdAt_idx" ON "PaymentEvent"("paymentId", "createdAt");
CREATE INDEX "PaymentRefund_paymentId_status_createdAt_idx" ON "PaymentRefund"("paymentId", "status", "createdAt");
CREATE UNIQUE INDEX "LegalDocument_type_key" ON "LegalDocument"("type");
CREATE UNIQUE INDEX "LegalDocument_slug_key" ON "LegalDocument"("slug");
CREATE INDEX "Category_isActive_archivedAt_sortOrder_idx" ON "Category"("isActive", "archivedAt", "sortOrder");
CREATE INDEX "Product_categoryId_isActive_archivedAt_sortOrder_idx" ON "Product"("categoryId", "isActive", "archivedAt", "sortOrder");
CREATE INDEX "Product_isActive_isFeatured_archivedAt_sortOrder_idx" ON "Product"("isActive", "isFeatured", "archivedAt", "sortOrder");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

ALTER TABLE "ProductOptionGroup" ADD CONSTRAINT "ProductOptionGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductOptionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiningTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeliveryAddress" ADD CONSTRAINT "DeliveryAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItemOption" ADD CONSTRAINT "OrderItemOption_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItemOption" ADD CONSTRAINT "OrderItemOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ProductOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentRefund" ADD CONSTRAINT "PaymentRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentRefund" ADD CONSTRAINT "PaymentRefund_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
