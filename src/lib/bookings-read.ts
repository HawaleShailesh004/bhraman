import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BookingSummary } from "@/types/booking";

type BookingWithPayment = Prisma.BookingGetPayload<{
  include: {
    payment: true;
    listing: {
      select: {
        slug: true;
        heroImageUrl: true;
        category: { select: { slug: true } };
        place: { select: { name: true } };
      };
    };
  };
}>;

function mapBookingSummary(booking: BookingWithPayment): BookingSummary {
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
    payment: booking.payment
      ? {
          status: booking.payment.status,
          amount: booking.payment.amount,
          razorpayOrderId: booking.payment.razorpayOrderId,
          razorpayPaymentId: booking.payment.razorpayPaymentId,
        }
      : null,
  };
}

export async function getBookingByRef(bookingRef: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingRef },
    include: {
      payment: true,
      listing: {
        select: {
          slug: true,
          heroImageUrl: true,
          category: { select: { slug: true } },
          place: { select: { name: true } },
        },
      },
    },
  });

  if (!booking) return null;
  return mapBookingSummary(booking);
}

export async function getTravelerBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      payment: true,
      listing: {
        select: {
          slug: true,
          heroImageUrl: true,
          category: { select: { slug: true } },
          place: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return bookings.map(mapBookingSummary);
}
