import type {
  BookingStatus,
  Gender,
  ListingStatus,
  PayoutStatus,
  PosHStatus,
  VerificationStatus,
} from "@prisma/client";

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
  endTime: string;
  groupSize: number;
  status: BookingStatus;
  totalAmount: number;
  escrowStatus: "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED" | null;
  disputeStatus:
    | "OPEN"
    | "PROCESSING"
    | "RESOLVED_OPERATOR"
    | "RESOLVED_CUSTOMER"
    | "RESOLVED_PARTIAL"
    | null;
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

export type OperatorVerificationData = {
  businessName: string;
  yearsOperating: number | null;
  panNumber: string | null;
  gstNumber: string | null;
  mtdcRegistrationNo: string | null;
  insuranceStatus: boolean;
  insuranceProvider: string | null;
  insuranceDetails: string | null;
  femaleGuideCount: number;
  totalGuideCount: number;
  posHPolicyStatus: PosHStatus;
  verificationStatus: VerificationStatus;
  phoneVerified: boolean;
};

export type OperatorCustomerRow = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  gender: Gender | null;
  completedBookings: number;
  lastTripAt: string;
  isRepeatCustomer: boolean;
};
