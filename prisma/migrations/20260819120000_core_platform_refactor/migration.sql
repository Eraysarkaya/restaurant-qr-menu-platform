-- Extend the restaurant CMS without removing legacy ordering data.
CREATE TYPE "FeaturePreset" AS ENUM ('QR_MENU_ONLY', 'RESTAURANT_WEBSITE', 'PREMIUM_WEBSITE');
CREATE TYPE "InstanceStatus" AS ENUM ('DRAFT', 'SETUP', 'ACTIVE', 'MAINTENANCE', 'ERROR', 'ARCHIVED');
CREATE TYPE "DeploymentProvider" AS ENUM ('VERCEL', 'OTHER');
CREATE TYPE "PlatformRole" AS ENUM ('DEVELOPER');
ALTER TYPE "UserRole" ADD VALUE 'EDITOR';

ALTER TABLE "RestaurantSettings"
  ADD COLUMN "featurePreset" "FeaturePreset" NOT NULL DEFAULT 'RESTAURANT_WEBSITE',
  ADD COLUMN "ownerCanEditBranding" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "showAboutPage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showContactPage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showFeaturedProducts" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showHero" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showHomePage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showMap" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showSocialLinks" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "PlatformUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "PlatformRole" NOT NULL DEFAULT 'DEVELOPER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlatformSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "PlatformSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantInstance" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "domain" TEXT,
  "status" "InstanceStatus" NOT NULL DEFAULT 'DRAFT',
  "templatePreset" "PublicThemePreset" NOT NULL DEFAULT 'WARM',
  "featurePreset" "FeaturePreset" NOT NULL DEFAULT 'RESTAURANT_WEBSITE',
  "deploymentProvider" "DeploymentProvider",
  "deploymentProjectId" TEXT,
  "managementEndpoint" TEXT,
  "primaryContactName" TEXT,
  "primaryContactEmail" TEXT,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#B4532A',
  "accentColor" TEXT NOT NULL DEFAULT '#66704A',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RestaurantInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlatformAuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "instanceId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OwnerInvitation" (
  "id" TEXT NOT NULL,
  "instanceId" TEXT NOT NULL,
  "createdById" TEXT,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OwnerInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportSession" (
  "id" TEXT NOT NULL,
  "instanceId" TEXT NOT NULL,
  "platformUserId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformUser_email_key" ON "PlatformUser"("email");
CREATE INDEX "PlatformUser_isActive_idx" ON "PlatformUser"("isActive");
CREATE UNIQUE INDEX "PlatformSession_tokenHash_key" ON "PlatformSession"("tokenHash");
CREATE INDEX "PlatformSession_userId_expiresAt_idx" ON "PlatformSession"("userId", "expiresAt");
CREATE INDEX "PlatformSession_expiresAt_idx" ON "PlatformSession"("expiresAt");
CREATE UNIQUE INDEX "RestaurantInstance_slug_key" ON "RestaurantInstance"("slug");
CREATE UNIQUE INDEX "RestaurantInstance_domain_key" ON "RestaurantInstance"("domain");
CREATE INDEX "RestaurantInstance_status_updatedAt_idx" ON "RestaurantInstance"("status", "updatedAt");
CREATE INDEX "RestaurantInstance_featurePreset_status_idx" ON "RestaurantInstance"("featurePreset", "status");
CREATE INDEX "PlatformAuditLog_createdAt_idx" ON "PlatformAuditLog"("createdAt");
CREATE INDEX "PlatformAuditLog_actorId_createdAt_idx" ON "PlatformAuditLog"("actorId", "createdAt");
CREATE INDEX "PlatformAuditLog_instanceId_createdAt_idx" ON "PlatformAuditLog"("instanceId", "createdAt");
CREATE INDEX "PlatformAuditLog_entityType_entityId_idx" ON "PlatformAuditLog"("entityType", "entityId");
CREATE UNIQUE INDEX "OwnerInvitation_tokenHash_key" ON "OwnerInvitation"("tokenHash");
CREATE INDEX "OwnerInvitation_instanceId_expiresAt_idx" ON "OwnerInvitation"("instanceId", "expiresAt");
CREATE INDEX "OwnerInvitation_email_expiresAt_idx" ON "OwnerInvitation"("email", "expiresAt");
CREATE UNIQUE INDEX "SupportSession_tokenHash_key" ON "SupportSession"("tokenHash");
CREATE INDEX "SupportSession_instanceId_expiresAt_idx" ON "SupportSession"("instanceId", "expiresAt");
CREATE INDEX "SupportSession_platformUserId_expiresAt_idx" ON "SupportSession"("platformUserId", "expiresAt");

ALTER TABLE "PlatformSession" ADD CONSTRAINT "PlatformSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlatformAuditLog" ADD CONSTRAINT "PlatformAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlatformAuditLog" ADD CONSTRAINT "PlatformAuditLog_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "RestaurantInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OwnerInvitation" ADD CONSTRAINT "OwnerInvitation_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "RestaurantInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OwnerInvitation" ADD CONSTRAINT "OwnerInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "RestaurantInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_platformUserId_fkey" FOREIGN KEY ("platformUserId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
