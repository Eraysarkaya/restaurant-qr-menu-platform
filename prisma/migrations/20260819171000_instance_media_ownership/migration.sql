ALTER TABLE "RestaurantInstance"
  ADD COLUMN "logoPublicId" TEXT,
  ADD COLUMN "heroImagePublicId" TEXT;

UPDATE "RestaurantInstance" AS instance
SET
  "logoPublicId" = settings."logoPublicId",
  "heroImagePublicId" = settings."heroImagePublicId"
FROM "RestaurantSettings" AS settings
WHERE instance."deploymentProjectId" = 'local' AND settings."id" = 'singleton';
