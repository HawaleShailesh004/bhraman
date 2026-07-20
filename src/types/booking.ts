import type {
  BookingStatus,
  DisputeStatus,
  EscrowStatus,
  PaymentStatus,
} from "@prisma/client";

export type BookingCheckoutResponse = {
  bookingId: string;
  bookingRef: string;
  razorpayOrderId: string;
  amount: number;
  currency: "INR";
  keyId: string | null;
  mode: "razorpay" | "mock";
};

export type BookingSummary = {
  id: string;
  bookingRef: string;
  status: BookingStatus;
  createdAt: string;
  groupSize: number;
  pricePerHead: number;
  totalAmount: number;
  listingTitleSnapshot: string;
  listingSlug: string;
  categorySlug: string;
  placeName: string;
  heroImageUrl: string | null;
  startTimeSnapshot: string;
  hasUnreadUpdates?: boolean;
  payment: {
    status: PaymentStatus;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    escrowStatus: EscrowStatus | null;
    disputeStatus: DisputeStatus | null;
  } | null;
};
