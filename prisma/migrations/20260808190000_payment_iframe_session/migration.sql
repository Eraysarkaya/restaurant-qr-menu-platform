ALTER TABLE "Payment"
  ADD COLUMN "iframeToken" TEXT,
  ADD COLUMN "iframeTokenExpiresAt" TIMESTAMP(3);
