import "server-only";

import {
  BookingStatus,
  DisputeActor,
  DisputeStatus,
  EscrowStatus,
  PaymentStatus,
  PayoutStatus,
  SlotStatus,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { refundCapturedPayment } from "@/lib/razorpay";

const PLATFORM_COMMISSION_RATE = 0.12;
const DEFAULT_DISPUTE_WINDOW_HOURS = 24;

async function queuePayout(
  tx: Prisma.TransactionClient,
  input: {
    paymentId: string;
    operatorId: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
  },
) {
  const commission = Math.round(input.amount * PLATFORM_COMMISSION_RATE);
  await tx.payout.upsert({
    where: { paymentId: input.paymentId },
    update: {},
    create: {
      operatorId: input.operatorId,
      paymentId: input.paymentId,
      amount: input.amount,
      commission,
      netAmount: input.amount - commission,
      status: PayoutStatus.PENDING,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    },
  });
}

export async function releaseEligibleEscrow(
  disputeWindowHours = DEFAULT_DISPUTE_WINDOW_HOURS,
) {
  const releaseCutoff = new Date(
    Date.now() - disputeWindowHours * 60 * 60 * 1000,
  );
  const candidates = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.CAPTURED,
      escrowStatus: EscrowStatus.HELD,
      disputeStatus: null,
      booking: {
        OR: [
          { status: BookingStatus.COMPLETED },
          {
            status: BookingStatus.CONFIRMED,
            slot: { endTime: { lte: releaseCutoff } },
          },
        ],
      },
    },
    select: { id: true },
    take: 100,
  });

  let released = 0;
  let grossAmount = 0;

  for (const candidate of candidates) {
    const result = await prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: candidate.id },
          include: {
            booking: {
              include: {
                listing: { select: { operatorId: true } },
                slot: true,
              },
            },
          },
        });

        if (
          !payment ||
          payment.status !== PaymentStatus.CAPTURED ||
          payment.escrowStatus !== EscrowStatus.HELD ||
          payment.disputeStatus !== null
        ) {
          return null;
        }

        const autoCompletionEligible =
          payment.booking.status === BookingStatus.CONFIRMED &&
          payment.booking.slot.endTime <= releaseCutoff;
        const operatorCompletionEligible =
          payment.booking.status === BookingStatus.COMPLETED &&
          payment.booking.slot.endTime <= new Date();

        if (!autoCompletionEligible && !operatorCompletionEligible) {
          return null;
        }

        const claimed = await tx.payment.updateMany({
          where: { id: payment.id, escrowStatus: EscrowStatus.HELD },
          data: {
            escrowStatus: EscrowStatus.RELEASED,
            releasedAt: new Date(),
          },
        });
        if (claimed.count === 0) return null;

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.COMPLETED },
        });
        await tx.availabilitySlot.update({
          where: { id: payment.booking.slotId },
          data: { status: SlotStatus.COMPLETED },
        });

        await queuePayout(tx, {
          operatorId: payment.booking.listing.operatorId,
          paymentId: payment.id,
          amount: payment.amount,
          periodStart: payment.booking.slot.startTime,
          periodEnd: payment.booking.slot.endTime,
        });

        return payment.amount;
      },
      { isolationLevel: "Serializable" },
    );

    if (result !== null) {
      released += 1;
      grossAmount += result;
    }
  }

  return { released, grossAmount };
}

export class EscrowError extends Error {
  constructor(
    public code:
      | "PAYMENT_NOT_FOUND"
      | "DISPUTE_NOT_ALLOWED"
      | "DISPUTE_NOT_OPEN"
      | "INVALID_REFUND_AMOUNT"
      | "RESOLUTION_IN_PROGRESS",
  ) {
    super(code);
  }
}

export async function openEscrowDispute(input: {
  bookingId: string;
  actor: DisputeActor;
  reason: string;
}) {
  const reason = input.reason.trim().slice(0, 2000);
  if (reason.length < 10) {
    throw new EscrowError("DISPUTE_NOT_ALLOWED");
  }

  const payment = await prisma.payment.findUnique({
    where: { bookingId: input.bookingId },
    select: { id: true },
  });
  if (!payment) throw new EscrowError("PAYMENT_NOT_FOUND");

  const opened = await prisma.payment.updateMany({
    where: {
      id: payment.id,
      status: PaymentStatus.CAPTURED,
      escrowStatus: EscrowStatus.HELD,
      disputeStatus: null,
    },
    data: {
      escrowStatus: EscrowStatus.DISPUTED,
      disputeStatus: DisputeStatus.OPEN,
      disputeReason: reason,
      disputeOpenedBy: input.actor,
      disputeCreatedAt: new Date(),
    },
  });
  if (opened.count === 0) {
    throw new EscrowError("DISPUTE_NOT_ALLOWED");
  }

  return { opened: true as const };
}

export async function resolveEscrowDispute(input: {
  paymentId: string;
  resolution: "RELEASE" | "REFUND" | "PARTIAL";
  refundAmount?: number;
  note: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: {
      booking: {
        include: {
          listing: { select: { operatorId: true } },
          slot: true,
        },
      },
    },
  });
  if (!payment) throw new EscrowError("PAYMENT_NOT_FOUND");
  if (payment.disputeStatus === DisputeStatus.PROCESSING) {
    throw new EscrowError("RESOLUTION_IN_PROGRESS");
  }
  if (
    payment.escrowStatus !== EscrowStatus.DISPUTED ||
    payment.disputeStatus !== DisputeStatus.OPEN
  ) {
    throw new EscrowError("DISPUTE_NOT_OPEN");
  }

  const refundAmount =
    input.resolution === "REFUND"
      ? payment.amount
      : input.resolution === "PARTIAL"
        ? input.refundAmount
        : 0;
  if (
    refundAmount === undefined ||
    refundAmount < 0 ||
    refundAmount > payment.amount ||
    (input.resolution === "PARTIAL" &&
      (refundAmount === 0 || refundAmount === payment.amount))
  ) {
    throw new EscrowError("INVALID_REFUND_AMOUNT");
  }

  const claimed = await prisma.payment.updateMany({
    where: {
      id: payment.id,
      escrowStatus: EscrowStatus.DISPUTED,
      disputeStatus: DisputeStatus.OPEN,
    },
    data: { disputeStatus: DisputeStatus.PROCESSING },
  });
  if (claimed.count === 0) {
    throw new EscrowError("RESOLUTION_IN_PROGRESS");
  }

  let razorpayRefundId: string | null = null;
  if (refundAmount > 0) {
    try {
      if (payment.razorpayOrderId.startsWith("mock_order_")) {
        razorpayRefundId = `mock_refund_${payment.id}`;
      } else {
        if (!payment.razorpayPaymentId) {
          throw new Error("PAYMENT_ID_MISSING");
        }
        const refund = await refundCapturedPayment({
          paymentId: payment.razorpayPaymentId,
          amount: refundAmount,
          receipt: `dispute-${payment.id}`,
          notes: { paymentId: payment.id, resolution: input.resolution },
        });
        razorpayRefundId = refund.id;
      }
    } catch (error) {
      await prisma.payment.updateMany({
        where: {
          id: payment.id,
          disputeStatus: DisputeStatus.PROCESSING,
        },
        data: { disputeStatus: DisputeStatus.OPEN },
      });
      throw error;
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const remainingAmount = payment.amount - refundAmount;
      if (remainingAmount > 0) {
        await queuePayout(tx, {
          operatorId: payment.booking.listing.operatorId,
          paymentId: payment.id,
          amount: remainingAmount,
          periodStart: payment.booking.slot.startTime,
          periodEnd: payment.booking.slot.endTime,
        });
      }

      const disputeStatus =
        input.resolution === "RELEASE"
          ? DisputeStatus.RESOLVED_OPERATOR
          : input.resolution === "REFUND"
            ? DisputeStatus.RESOLVED_CUSTOMER
            : DisputeStatus.RESOLVED_PARTIAL;
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status:
            refundAmount === 0
              ? PaymentStatus.CAPTURED
              : refundAmount === payment.amount
                ? PaymentStatus.REFUNDED
                : PaymentStatus.PARTIALLY_REFUNDED,
          refundedAmount: refundAmount || null,
          razorpayRefundId,
          escrowStatus:
            remainingAmount > 0
              ? EscrowStatus.RELEASED
              : EscrowStatus.REFUNDED,
          releasedAt: remainingAmount > 0 ? new Date() : null,
          disputeStatus,
          disputeResolutionNote: input.note.trim().slice(0, 2000) || null,
          disputeResolvedAt: new Date(),
        },
      });
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status:
            refundAmount === payment.amount
              ? BookingStatus.REFUNDED
              : BookingStatus.COMPLETED,
        },
      });

      return { resolved: true as const, disputeStatus };
    },
    { isolationLevel: "Serializable" },
  );
}
