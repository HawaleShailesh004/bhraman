import "server-only";

import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import type {
  OperatorBookingRow,
  OperatorDashboardData,
  OperatorCustomerRow,
  OperatorListingRow,
  OperatorPayoutRow,
  OperatorVerificationData,
} from "@/types/operator";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapBookingRow(booking: {
  id: string;
  bookingRef: string;
  groupSize: number;
  status: OperatorBookingRow["status"];
  totalAmount: number;
  listingTitleSnapshot: string;
  startTimeSnapshot: Date;
  slot: { endTime: Date };
  user: { name: string };
  payment: {
    escrowStatus: OperatorBookingRow["escrowStatus"];
    disputeStatus: OperatorBookingRow["disputeStatus"];
  } | null;
}): OperatorBookingRow {
  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    travelerName: booking.user.name,
    travelerInitials: initials(booking.user.name),
    listingTitle: booking.listingTitleSnapshot,
    startTime: booking.startTimeSnapshot.toISOString(),
    endTime: booking.slot.endTime.toISOString(),
    groupSize: booking.groupSize,
    status: booking.status,
    totalAmount: booking.totalAmount,
    escrowStatus: booking.payment?.escrowStatus ?? null,
    disputeStatus: booking.payment?.disputeStatus ?? null,
  };
}

export async function getOperatorDashboard(
  operatorId: string
): Promise<OperatorDashboardData> {
  const operator = await prisma.operator.findUniqueOrThrow({
    where: { id: operatorId },
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [weeklyBookings, weeklyRevenue, pendingPayout, upcomingBookings] =
    await Promise.all([
      prisma.booking.count({
        where: {
          listing: { operatorId },
          createdAt: { gte: weekAgo },
          status: { in: ["CONFIRMED", "COMPLETED", "PENDING"] },
        },
      }),
      prisma.booking.aggregate({
        where: {
          listing: { operatorId },
          createdAt: { gte: weekAgo },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.payout.aggregate({
        where: { operatorId, status: { in: ["PENDING", "PROCESSING"] } },
        _sum: { netAmount: true },
      }),
      prisma.booking.findMany({
        where: {
          listing: { operatorId },
          startTimeSnapshot: { gte: new Date() },
          status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
        },
        include: {
          user: { select: { name: true } },
          slot: { select: { endTime: true } },
          payment: {
            select: { escrowStatus: true, disputeStatus: true },
          },
        },
        orderBy: { startTimeSnapshot: "asc" },
        take: 8,
      }),
    ]);

  const revenue = weeklyRevenue._sum.totalAmount ?? 0;
  const payoutPending = pendingPayout._sum.netAmount ?? 0;

  return {
    businessName: operator.businessName,
    stats: [
      {
        label: "Bookings (wk)",
        value: String(weeklyBookings),
        delta: "▲ live from DB",
        tone: "up",
      },
      {
        label: "Revenue (wk)",
        value: formatInr(revenue),
        delta: "▲ confirmed trips",
        tone: "up",
      },
      {
        label: "Pending payout",
        value: formatInr(payoutPending),
        delta: "Fri settlement",
        tone: "neutral",
      },
      {
        label: "Rating",
        value: operator.ratingAvg.toFixed(1),
        delta: `${operator.ratingCount} reviews`,
        tone: "up",
      },
    ],
    upcomingBookings: upcomingBookings.map(mapBookingRow),
  };
}

export async function getOperatorListings(
  operatorId: string
): Promise<OperatorListingRow[]> {
  const listings = await prisma.listing.findMany({
    where: { operatorId },
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return listings.map((listing) => ({
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    categoryName: listing.category.name,
    categorySlug: listing.category.slug,
    basePrice: listing.basePrice,
    status: listing.status,
    bookingCount: listing._count.bookings,
    ratingAvg: 0,
    heroImageUrl: listing.heroImageUrl,
  }));
}

export async function getOperatorBookings(
  operatorId: string
): Promise<OperatorBookingRow[]> {
  const bookings = await prisma.booking.findMany({
    where: { listing: { operatorId } },
    include: {
      user: { select: { name: true } },
      slot: { select: { endTime: true } },
      payment: { select: { escrowStatus: true, disputeStatus: true } },
    },
    orderBy: { startTimeSnapshot: "desc" },
    take: 50,
  });

  return bookings.map(mapBookingRow);
}

export async function getOperatorBookingDetail(
  operatorId: string,
  bookingId: string,
) {
  return prisma.booking.findFirst({
    where: { id: bookingId, listing: { operatorId } },
    select: {
      id: true,
      bookingRef: true,
      status: true,
      listingTitleSnapshot: true,
      startTimeSnapshot: true,
      groupSize: true,
      customerPhone: true,
      customerEmail: true,
      customerGender: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
      medicalNotes: true,
      user: { select: { name: true, email: true } },
      payment: {
        select: {
          escrowStatus: true,
          disputeStatus: true,
        },
      },
    },
  });
}

export async function getOperatorPayouts(
  operatorId: string
): Promise<OperatorPayoutRow[]> {
  const payouts = await prisma.payout.findMany({
    where: { operatorId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return payouts.map((payout) => ({
    id: payout.id,
    amount: payout.amount,
    commission: payout.commission,
    netAmount: payout.netAmount,
    status: payout.status,
    referenceId: payout.referenceId,
    periodStart: payout.periodStart.toISOString(),
    periodEnd: payout.periodEnd.toISOString(),
  }));
}

export async function getOperatorListingOptions(operatorId: string) {
  return prisma.listing.findMany({
    where: { operatorId },
    select: {
      id: true,
      title: true,
      durationHours: true,
      maxGroupSize: true,
      status: true,
    },
    orderBy: { title: "asc" },
  });
}

export async function getOperatorPlaces() {
  return prisma.place.findMany({
    select: { id: true, name: true, city: true, slug: true },
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function getOperatorCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function getOperatorVerification(
  operatorId: string,
): Promise<OperatorVerificationData> {
  return prisma.operator.findUniqueOrThrow({
    where: { id: operatorId },
    select: {
      businessName: true,
      yearsOperating: true,
      panNumber: true,
      gstNumber: true,
      mtdcRegistrationNo: true,
      insuranceStatus: true,
      insuranceProvider: true,
      insuranceDetails: true,
      femaleGuideCount: true,
      totalGuideCount: true,
      posHPolicyStatus: true,
      verificationStatus: true,
      phoneVerified: true,
    },
  });
}

export async function getOperatorCustomers(
  operatorId: string,
): Promise<OperatorCustomerRow[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      listing: { operatorId },
      status: "COMPLETED",
    },
    select: {
      userId: true,
      customerPhone: true,
      customerGender: true,
      startTimeSnapshot: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { startTimeSnapshot: "desc" },
  });

  const customers = new Map<string, OperatorCustomerRow>();
  for (const booking of bookings) {
    const existing = customers.get(booking.userId);
    if (existing) {
      existing.completedBookings += 1;
      existing.isRepeatCustomer = true;
      if (!existing.phone && booking.customerPhone) {
        existing.phone = booking.customerPhone;
      }
      if (!existing.gender && booking.customerGender) {
        existing.gender = booking.customerGender;
      }
      continue;
    }

    customers.set(booking.userId, {
      userId: booking.userId,
      name: booking.user.name,
      email: booking.user.email,
      phone: booking.customerPhone,
      gender: booking.customerGender,
      completedBookings: 1,
      lastTripAt: booking.startTimeSnapshot.toISOString(),
      isRepeatCustomer: false,
    });
  }

  return Array.from(customers.values()).sort(
    (a, b) =>
      b.completedBookings - a.completedBookings ||
      b.lastTripAt.localeCompare(a.lastTripAt),
  );
}
