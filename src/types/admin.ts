import type { DisputeActor, DisputeStatus } from "@prisma/client";

export type AdminDisputeRow = {
  paymentId: string;
  bookingId: string;
  bookingRef: string;
  travelerName: string;
  travelerEmail: string;
  operatorName: string;
  listingTitle: string;
  amount: number;
  refundedAmount: number | null;
  reason: string;
  openedBy: DisputeActor | null;
  status: DisputeStatus;
  createdAt: string;
};
