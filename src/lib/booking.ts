import "server-only";

import { BookingStatus, PaymentStatus, SlotStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeRefund, type CancellationPolicy } from "@/lib/refunds";

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
};

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
        AND status = 'OPEN'::"SlotStatus"
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
        status: BookingStatus.PENDING,
      },
    });

    if (slot.bookedSeats >= slot.capacity) {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { status: SlotStatus.FULL },
      });
    }

    return booking;
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
    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: {
          bookedSeats: { decrement: booking.groupSize },
          status: SlotStatus.OPEN,
        },
      });

      if (booking.payment) {
        await tx.payment.delete({ where: { bookingId: booking.id } });
      }

      await tx.booking.delete({ where: { id: booking.id } });
    });

    released += 1;
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
    await tx.availabilitySlot.update({
      where: { id: booking.slotId },
      data: {
        bookedSeats: { decrement: booking.groupSize },
        status: SlotStatus.OPEN,
      },
    });

    if (booking.payment) {
      await tx.payment.update({
        where: { bookingId: booking.id },
        data: {
          refundedAmount: refundAmount,
          status:
            refundAmount === booking.totalAmount
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIALLY_REFUNDED,
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
  });

  return { refundAmount };
}
