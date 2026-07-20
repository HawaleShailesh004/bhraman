import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db";
import type { BookingSummary } from "@/types/booking";

type BookingWithPayment = Prisma.BookingGetPayload<{
  include: {
    payment: true;
    updateRead: true;
    listing: {
      select: {
        slug: true;
        heroImageUrl: true;
        category: { select: { slug: true } };
        place: { select: { name: true } };
      };
    };
    slot: {
      select: {
        updates: {
          select: { createdAt: true };
          orderBy: { createdAt: "desc" };
          take: 1;
        };
      };
    };
  };
}>;

function mapBookingSummary(booking: BookingWithPayment): BookingSummary {
  const latestUpdate = booking.slot.updates[0]?.createdAt ?? null;
  const lastRead = booking.updateRead?.lastReadAt ?? null;
  const hasUnreadUpdates = Boolean(
    latestUpdate && (!lastRead || latestUpdate > lastRead),
  );

  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    groupSize: booking.groupSize,
    pricePerHead: booking.pricePerHead,
    totalAmount: booking.totalAmount,
    listingTitleSnapshot: booking.listingTitleSnapshot,
    listingSlug: booking.listing.slug,
    categorySlug: booking.listing.category.slug,
    placeName: booking.listing.place.name,
    heroImageUrl: booking.listing.heroImageUrl,
    startTimeSnapshot: booking.startTimeSnapshot.toISOString(),
    hasUnreadUpdates,
    payment: booking.payment
      ? {
          status: booking.payment.status,
          amount: booking.payment.amount,
          razorpayOrderId: booking.payment.razorpayOrderId,
          razorpayPaymentId: booking.payment.razorpayPaymentId,
          escrowStatus: booking.payment.escrowStatus,
          disputeStatus: booking.payment.disputeStatus,
        }
      : null,
  };
}

const bookingInclude = {
  payment: true,
  updateRead: true,
  listing: {
    select: {
      slug: true,
      heroImageUrl: true,
      category: { select: { slug: true } },
      place: { select: { name: true } },
    },
  },
  slot: {
    select: {
      updates: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" as const },
        take: 1,
      },
    },
  },
} satisfies Prisma.BookingInclude;

export async function getBookingByRef(bookingRef: string) {
  return withDbFallback(async () => {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: bookingInclude,
    });

    if (!booking) return null;
    return mapBookingSummary(booking);
  }, null);
}

export async function getTravelerBookings(userId: string) {
  return withDbFallback(async () => {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return bookings.map(mapBookingSummary);
  }, []);
}
