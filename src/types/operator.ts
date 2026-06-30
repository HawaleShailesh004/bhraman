import type { BookingStatus, ListingStatus, PayoutStatus } from "@prisma/client";

export type OperatorStat = {
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "neutral";
};

export type OperatorBookingRow = {
  id: string;
  bookingRef: string;
  travelerName: string;
  travelerInitials: string;
  listingTitle: string;
  startTime: string;
  groupSize: number;
  status: BookingStatus;
  totalAmount: number;
};

export type OperatorListingRow = {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  basePrice: number;
  status: ListingStatus;
  bookingCount: number;
  ratingAvg: number;
  heroImageUrl: string | null;
};

export type OperatorPayoutRow = {
  id: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: PayoutStatus;
  referenceId: string | null;
  periodStart: string;
  periodEnd: string;
};

export type OperatorDashboardData = {
  businessName: string;
  stats: OperatorStat[];
  upcomingBookings: OperatorBookingRow[];
};
