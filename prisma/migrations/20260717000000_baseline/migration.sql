-- Baseline generated from the pre-production Prisma schema.
-- Existing databases created with `prisma db push` must mark this migration
-- as applied before running `prisma migrate deploy`.

CREATE TYPE "UserRole" AS ENUM ('TRAVELER', 'OPERATOR', 'ADMIN');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'CHALLENGING', 'EXTREME');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED');
CREATE TYPE "SlotStatus" AS ENUM ('OPEN', 'FULL', 'CLOSED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "clerkId" TEXT,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'TRAVELER',
  "homeCity" TEXT,
  "fitnessLevel" "Difficulty",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Operator" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "baseCity" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "completedTrips" INTEGER NOT NULL DEFAULT 0,
  "avgResponseMins" INTEGER NOT NULL DEFAULT 30,
  "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "icon" TEXT,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Place" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'Maharashtra',
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "elevationM" INTEGER,
  "description" TEXT NOT NULL,
  "bestMonths" INTEGER[],
  "region" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Listing" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "durationHours" DOUBLE PRECISION NOT NULL,
  "basePrice" INTEGER NOT NULL,
  "minGroupSize" INTEGER NOT NULL,
  "maxGroupSize" INTEGER NOT NULL,
  "inclusions" TEXT[],
  "exclusions" TEXT[],
  "thingsToCarry" TEXT[],
  "meetingPoint" TEXT,
  "cancellationPolicy" JSONB NOT NULL,
  "heroImageUrl" TEXT,
  "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ItineraryStep" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "timeLabel" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "ItineraryStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AvailabilitySlot" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "bookedSeats" INTEGER NOT NULL DEFAULT 0,
  "priceOverride" INTEGER,
  "status" "SlotStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Booking" (
  "id" TEXT NOT NULL,
  "bookingRef" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "slotId" TEXT NOT NULL,
  "groupSize" INTEGER NOT NULL,
  "pricePerHead" INTEGER NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "listingTitleSnapshot" TEXT NOT NULL,
  "startTimeSnapshot" TIMESTAMP(3) NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "razorpayOrderId" TEXT NOT NULL,
  "razorpayPaymentId" TEXT,
  "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "refundedAmount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payout" (
  "id" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "commission" INTEGER NOT NULL,
  "netAmount" INTEGER NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "referenceId" TEXT,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Operator_userId_key" ON "Operator"("userId");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Place_city_idx" ON "Place"("city");
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");
CREATE INDEX "Listing_categoryId_difficulty_idx" ON "Listing"("categoryId", "difficulty");
CREATE INDEX "Listing_basePrice_idx" ON "Listing"("basePrice");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
CREATE UNIQUE INDEX "ItineraryStep_listingId_order_key" ON "ItineraryStep"("listingId", "order");
CREATE INDEX "AvailabilitySlot_listingId_startTime_idx" ON "AvailabilitySlot"("listingId", "startTime");
CREATE UNIQUE INDEX "Booking_bookingRef_key" ON "Booking"("bookingRef");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_listingId_idx" ON "Booking"("listingId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");
CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");
CREATE UNIQUE INDEX "Review_userId_listingId_key" ON "Review"("userId", "listingId");
CREATE INDEX "Payout_operatorId_idx" ON "Payout"("operatorId");

ALTER TABLE "Operator" ADD CONSTRAINT "Operator_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_placeId_fkey"
  FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ItineraryStep" ADD CONSTRAINT "ItineraryStep_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey"
  FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
