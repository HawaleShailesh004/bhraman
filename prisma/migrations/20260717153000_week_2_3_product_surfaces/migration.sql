ALTER TABLE "Operator" ADD COLUMN "slug" TEXT;

UPDATE "Operator"
SET "slug" =
  COALESCE(
    NULLIF(
      TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("businessName"), '[^a-z0-9]+', '-', 'g')),
      ''
    ),
    'operator'
  ) || '-' || LEFT("id", 6);

ALTER TABLE "Operator" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Operator_slug_key" ON "Operator"("slug");

ALTER TABLE "Booking"
  ADD COLUMN "customerEmail" TEXT,
  ADD COLUMN "customerPhone" TEXT;

UPDATE "Booking" AS booking
SET "customerEmail" = app_user."email"
FROM "User" AS app_user
WHERE app_user."id" = booking."userId";

CREATE INDEX "Booking_customerEmail_idx" ON "Booking"("customerEmail");
CREATE INDEX "Booking_customerPhone_idx" ON "Booking"("customerPhone");

CREATE TYPE "DisputeActor" AS ENUM ('TRAVELER', 'OPERATOR');
ALTER TYPE "DisputeStatus" ADD VALUE 'PROCESSING' AFTER 'OPEN';
ALTER TABLE "Payment"
  ADD COLUMN "razorpayRefundId" TEXT,
  ADD COLUMN "disputeOpenedBy" "DisputeActor",
  ADD COLUMN "disputeCreatedAt" TIMESTAMP(3),
  ADD COLUMN "disputeResolutionNote" TEXT,
  ADD COLUMN "disputeResolvedAt" TIMESTAMP(3);
