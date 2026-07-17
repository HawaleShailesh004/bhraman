-- Week 1 production foundation.
-- This repository previously used `prisma db push`; baseline the existing
-- database before applying this migration (see prisma/migrations/README.md).

CREATE TYPE "PosHStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');
CREATE TYPE "DisputeStatus" AS ENUM (
  'OPEN',
  'RESOLVED_OPERATOR',
  'RESOLVED_CUSTOMER',
  'RESOLVED_PARTIAL'
);

ALTER TYPE "SlotStatus" RENAME VALUE 'CLOSED' TO 'CANCELLED';
ALTER TYPE "SlotStatus" ADD VALUE 'FILLING_FAST' AFTER 'OPEN';
ALTER TYPE "SlotStatus" ADD VALUE 'CONFIRMED' AFTER 'FILLING_FAST';
ALTER TYPE "SlotStatus" ADD VALUE 'COMPLETED' AFTER 'CANCELLED';

ALTER TABLE "Operator"
  ADD COLUMN "yearsOperating" INTEGER,
  ADD COLUMN "panNumber" TEXT,
  ADD COLUMN "gstNumber" TEXT,
  ADD COLUMN "mtdcRegistrationNo" TEXT,
  ADD COLUMN "insuranceStatus" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "insuranceProvider" TEXT,
  ADD COLUMN "insuranceDetails" TEXT,
  ADD COLUMN "femaleGuideCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "totalGuideCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "posHPolicyStatus" "PosHStatus" NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Operator"
SET "verificationStatus" = CASE
  WHEN "isVerified" THEN 'VERIFIED'::"VerificationStatus"
  ELSE 'UNVERIFIED'::"VerificationStatus"
END;

ALTER TABLE "Operator" DROP COLUMN "isVerified";

ALTER TABLE "Listing" ADD COLUMN "attributes" JSONB;

ALTER TABLE "AvailabilitySlot"
  ADD COLUMN "maleCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "femaleCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "otherCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "minSeatsToConfirm" INTEGER;

ALTER TABLE "Booking"
  ADD COLUMN "customerGender" "Gender",
  ADD COLUMN "isRepeatCustomer" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "emergencyContactName" TEXT,
  ADD COLUMN "emergencyContactPhone" TEXT,
  ADD COLUMN "medicalNotes" TEXT;

ALTER TABLE "Payment"
  ADD COLUMN "escrowStatus" "EscrowStatus",
  ADD COLUMN "heldAt" TIMESTAMP(3),
  ADD COLUMN "releasedAt" TIMESTAMP(3),
  ADD COLUMN "disputeReason" TEXT,
  ADD COLUMN "disputeStatus" "DisputeStatus";

UPDATE "Payment"
SET
  "escrowStatus" = CASE
    WHEN "status" = 'CAPTURED' THEN 'HELD'::"EscrowStatus"
    WHEN "status" IN ('REFUNDED', 'PARTIALLY_REFUNDED') THEN 'REFUNDED'::"EscrowStatus"
    ELSE NULL
  END,
  "heldAt" = CASE
    WHEN "status" = 'CAPTURED' THEN "updatedAt"
    ELSE NULL
  END;

CREATE INDEX "Payment_escrowStatus_idx" ON "Payment"("escrowStatus");

ALTER TABLE "Payout" ADD COLUMN "paymentId" TEXT;
CREATE UNIQUE INDEX "Payout_paymentId_key" ON "Payout"("paymentId");
ALTER TABLE "Payout"
  ADD CONSTRAINT "Payout_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Review" ADD COLUMN "bookingId" TEXT;

UPDATE "Review" AS review
SET "bookingId" = (
  SELECT booking."id"
  FROM "Booking" AS booking
  WHERE booking."userId" = review."userId"
    AND booking."listingId" = review."listingId"
    AND booking."status" = 'COMPLETED'
  ORDER BY booking."createdAt" DESC
  LIMIT 1
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Review" WHERE "bookingId" IS NULL) THEN
    RAISE EXCEPTION
      'Cannot migrate reviews: every review must have a completed matching booking';
  END IF;
END $$;

ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";
DROP INDEX "Review_userId_listingId_key";
ALTER TABLE "Review"
  DROP COLUMN "userId",
  DROP COLUMN "isVerified",
  ALTER COLUMN "bookingId" SET NOT NULL;

CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
