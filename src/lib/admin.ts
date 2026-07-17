import "server-only";

import { DisputeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminDisputeRow } from "@/types/admin";

export async function getAdminDisputes(): Promise<AdminDisputeRow[]> {
  const payments = await prisma.payment.findMany({
    where: {
      disputeStatus: {
        in: [DisputeStatus.OPEN, DisputeStatus.PROCESSING],
      },
    },
    include: {
      booking: {
        include: {
          user: { select: { name: true, email: true } },
          listing: {
            select: {
              title: true,
              operator: { select: { businessName: true } },
            },
          },
        },
      },
    },
    orderBy: { disputeCreatedAt: "asc" },
  });

  return payments.map((payment) => ({
    paymentId: payment.id,
    bookingId: payment.bookingId,
    bookingRef: payment.booking.bookingRef,
    travelerName: payment.booking.user.name,
    travelerEmail: payment.booking.user.email,
    operatorName: payment.booking.listing.operator.businessName,
    listingTitle: payment.booking.listing.title,
    amount: payment.amount,
    refundedAmount: payment.refundedAmount,
    reason: payment.disputeReason ?? "No reason provided",
    openedBy: payment.disputeOpenedBy,
    status: payment.disputeStatus ?? DisputeStatus.OPEN,
    createdAt: (
      payment.disputeCreatedAt ?? payment.updatedAt
    ).toISOString(),
  }));
}
