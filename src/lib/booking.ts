import "server-only";

import {
  BookingStatus,
  EscrowStatus,
  Gender,
  PaymentStatus,
  SlotStatus,
  type AgeBand,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { sendBookingConfirmation } from "@/lib/email";
import { fetchCapturedPaymentForOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { computeRefund, type CancellationPolicy } from "@/lib/refunds";
import { recomputeSlotComposition } from "@/lib/batches";

export class BookingError extends Error {
  constructor(public code: "SLOT_UNAVAILABLE" | "INVALID_GROUP_SIZE" | "BOOKING_NOT_FOUND") {
    super(code);
  }
}

export type CreateBookingInput = {
  userId: string;
  listingId: string;
  slotId: string;
  groupSize: number;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerGender?: Gender | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  medicalNotes?: string | null;
  participants?: {
    name: string;
    gender?: Gender | null;
    ageBand?: AgeBand | null;
    age?: number | null;
  }[];
};

function getActiveSlotStatus(input: {
  bookedSeats: number;
  capacity: number;
  minSeatsToConfirm: number | null;
  confirmedSeats: number;
}) {
  if (input.bookedSeats >= input.capacity) return SlotStatus.FULL;
  if (
    input.minSeatsToConfirm !== null &&
    input.confirmedSeats >= input.minSeatsToConfirm
  ) {
    return SlotStatus.CONFIRMED;
  }
  if (input.bookedSeats / input.capacity >= 0.7) {
    return SlotStatus.FILLING_FAST;
  }
  return SlotStatus.OPEN;
}

async function refreshSlotStatus(
  tx: Prisma.TransactionClient,
  slotId: string,
) {
  const [slot, confirmed] = await Promise.all([
    tx.availabilitySlot.findUniqueOrThrow({ where: { id: slotId } }),
    tx.booking.aggregate({
      where: {
        slotId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      _sum: { groupSize: true },
    }),
  ]);

  if (
    slot.status === SlotStatus.CANCELLED ||
    slot.status === SlotStatus.COMPLETED
  ) {
    return slot;
  }

  return tx.availabilitySlot.update({
    where: { id: slotId },
    data: {
      status: getActiveSlotStatus({
        bookedSeats: slot.bookedSeats,
        capacity: slot.capacity,
        minSeatsToConfirm: slot.minSeatsToConfirm,
        confirmedSeats: confirmed._sum.groupSize ?? 0,
      }),
    },
  });
}

function genRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `BHR-${suffix}`;
}

export async function createBooking(input: CreateBookingInput) {
  return prisma.$transaction(async (tx) => {
    const slotRecord = await tx.availabilitySlot.findUnique({
      where: { id: input.slotId },
      include: {
        listing: {
          select: {
            id: true,
            operatorId: true,
            title: true,
            minGroupSize: true,
            maxGroupSize: true,
            basePrice: true,
          },
        },
      },
    });

    if (
      !slotRecord ||
      slotRecord.listing.id !== input.listingId ||
      input.groupSize < slotRecord.listing.minGroupSize ||
      input.groupSize > slotRecord.listing.maxGroupSize
    ) {
      throw new BookingError("INVALID_GROUP_SIZE");
    }

    const claimed = await tx.$executeRaw`
      UPDATE "AvailabilitySlot"
      SET "bookedSeats" = "bookedSeats" + ${input.groupSize}
      WHERE id = ${input.slotId}
        AND status IN (
          'OPEN'::"SlotStatus",
          'FILLING_FAST'::"SlotStatus",
          'CONFIRMED'::"SlotStatus"
        )
        AND "bookedSeats" + ${input.groupSize} <= capacity
    `;

    if (claimed === 0) {
      throw new BookingError("SLOT_UNAVAILABLE");
    }

    const slot = await tx.availabilitySlot.findUnique({
      where: { id: input.slotId },
      include: {
        listing: {
          select: {
            title: true,
            basePrice: true,
          },
        },
      },
    });

    if (!slot) {
      throw new BookingError("SLOT_UNAVAILABLE");
    }

    const pricePerHead = slot.priceOverride ?? slot.listing.basePrice;
    const priorCompletedBooking = await tx.booking.findFirst({
      where: {
        userId: input.userId,
        listing: { operatorId: slotRecord.listing.operatorId },
        status: BookingStatus.COMPLETED,
      },
      select: { id: true },
    });

    const participants =
      input.participants && input.participants.length > 0
        ? input.participants.slice(0, input.groupSize)
        : [
            {
              name: "Traveler",
              gender: input.customerGender ?? null,
              ageBand: null as AgeBand | null,
              age: null as number | null,
            },
          ];

    while (participants.length < input.groupSize) {
      participants.push({
        name: `Guest ${participants.length + 1}`,
        gender: null,
        ageBand: null,
        age: null,
      });
    }

    const booking = await tx.booking.create({
      data: {
        bookingRef: genRef(),
        userId: input.userId,
        listingId: input.listingId,
        slotId: input.slotId,
        groupSize: input.groupSize,
        pricePerHead,
        totalAmount: pricePerHead * input.groupSize,
        listingTitleSnapshot: slot.listing.title,
        startTimeSnapshot: slot.startTime,
        customerEmail: input.customerEmail ?? null,
        customerPhone: input.customerPhone ?? null,
        customerGender: input.customerGender ?? null,
        isRepeatCustomer: Boolean(priorCompletedBooking),
        emergencyContactName: input.emergencyContactName ?? null,
        emergencyContactPhone: input.emergencyContactPhone ?? null,
        medicalNotes: input.medicalNotes ?? null,
        status: BookingStatus.PENDING,
        participants: {
          create: participants.map((p) => ({
            name: p.name.trim().slice(0, 120) || "Traveler",
            gender: p.gender ?? null,
            ageBand: p.ageBand ?? null,
            age: p.age ?? null,
          })),
        },
      },
    });

    await recomputeSlotComposition(slot.id, tx);

    return booking;
  });
}

export async function confirmCapturedPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}) {
  const result = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.payment.findUnique({
        where: { razorpayOrderId: input.razorpayOrderId },
        include: {
          booking: { select: { id: true, slotId: true, customerGender: true } },
        },
      });

      if (!existing) {
        return {
          confirmed: false as const,
          reason: "PAYMENT_NOT_FOUND" as const,
        };
      }

      if (existing.status === PaymentStatus.CAPTURED) {
        return { confirmed: true as const, alreadyConfirmed: true as const };
      }

      const claimed = await tx.payment.updateMany({
        where: { id: existing.id, status: PaymentStatus.CREATED },
        data: {
          status: PaymentStatus.CAPTURED,
          razorpayPaymentId: input.razorpayPaymentId,
          escrowStatus: EscrowStatus.HELD,
          heldAt: new Date(),
        },
      });

      if (claimed.count === 0) {
        return {
          confirmed: false as const,
          reason: "PAYMENT_NOT_CONFIRMABLE" as const,
        };
      }

      await tx.booking.update({
        where: { id: existing.booking.id },
        data: { status: BookingStatus.CONFIRMED },
      });

      await recomputeSlotComposition(existing.booking.slotId, tx);

      return {
        confirmed: true as const,
        alreadyConfirmed: false as const,
        bookingId: existing.booking.id,
      };
    },
    { isolationLevel: "Serializable" },
  );

  if (result.confirmed && !result.alreadyConfirmed && "bookingId" in result) {
    try {
      await sendBookingConfirmation(result.bookingId);
    } catch (error) {
      console.error("Booking confirmed but confirmation email failed", {
        bookingId: result.bookingId,
        error,
      });
    }
  }

  return result.confirmed && "alreadyConfirmed" in result
    ? {
        confirmed: result.confirmed,
        alreadyConfirmed: result.alreadyConfirmed,
      }
    : result;
}

export async function syncPendingPayment(razorpayOrderId: string) {
  const captured = await fetchCapturedPaymentForOrder(razorpayOrderId);
  if (!captured) {
    return { confirmed: false as const, reason: "NOT_CAPTURED" as const };
  }

  return confirmCapturedPayment({
    razorpayOrderId: captured.orderId,
    razorpayPaymentId: captured.paymentId,
  });
}

export async function releaseExpiredPendingBookings(cutoffMinutes = 15) {
  const threshold = new Date(Date.now() - cutoffMinutes * 60_000);
  const staleBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PENDING,
      createdAt: { lte: threshold },
    },
    include: {
      payment: true,
      slot: true,
    },
  });

  let released = 0;

  for (const booking of staleBookings) {
    if (
      booking.payment &&
      !booking.payment.razorpayOrderId.startsWith("mock_order_")
    ) {
      try {
        const synced = await syncPendingPayment(
          booking.payment.razorpayOrderId,
        );
        if (synced.confirmed) continue;
      } catch (error) {
        console.error("Seat release skipped because payment sync failed", {
          bookingId: booking.id,
          error,
        });
        continue;
      }
    }

    const didRelease = await prisma.$transaction(
      async (tx) => {
        const current = await tx.booking.findUnique({
          where: { id: booking.id },
          include: { payment: true, slot: true },
        });
        if (
          !current ||
          current.status !== BookingStatus.PENDING ||
          current.payment?.status === PaymentStatus.CAPTURED
        ) {
          return false;
        }

        if (current.payment) {
          await tx.payment.delete({ where: { bookingId: current.id } });
        }
        await tx.booking.delete({ where: { id: current.id } });
        await recomputeSlotComposition(current.slotId, tx);
        return true;
      },
      { isolationLevel: "Serializable" },
    );

    if (didRelease) released += 1;
  }

  return { released };
}

export async function cancelBooking(
  bookingId: string,
  reason: "USER" | "WEATHER"
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { cancellationPolicy: true } },
      payment: true,
      slot: true,
    },
  });

  if (!booking) {
    throw new BookingError("BOOKING_NOT_FOUND");
  }
  if (
    booking.status !== BookingStatus.PENDING &&
    booking.status !== BookingStatus.CONFIRMED
  ) {
    throw new BookingError("BOOKING_NOT_FOUND");
  }

  const policy = booking.listing
    .cancellationPolicy as CancellationPolicy;
  const refundAmount = computeRefund(
    {
      totalAmount: booking.totalAmount,
      startTimeSnapshot: booking.startTimeSnapshot,
    },
    policy,
    reason
  );

  await prisma.$transaction(async (tx) => {
    if (booking.payment) {
      await tx.payment.update({
        where: { bookingId: booking.id },
        data: {
          refundedAmount: refundAmount,
          status:
            refundAmount === booking.totalAmount
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIALLY_REFUNDED,
          escrowStatus: EscrowStatus.REFUNDED,
        },
      });
    }

    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status:
          refundAmount === booking.totalAmount
            ? BookingStatus.REFUNDED
            : BookingStatus.CANCELLED,
      },
    });
    await recomputeSlotComposition(booking.slotId, tx);
  }, { isolationLevel: "Serializable" });

  return { refundAmount };
}
