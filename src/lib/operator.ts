import "server-only";

import { PayoutStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import type {
  OperatorBookingRow,
  OperatorDashboardData,
  OperatorListingRow,
  OperatorPayoutRow,
} from "@/types/operator";

const PLATFORM_COMMISSION_RATE = 0.12;

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
  user: { name: string };
}): OperatorBookingRow {
  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    travelerName: booking.user.name,
    travelerInitials: initials(booking.user.name),
    listingTitle: booking.listingTitleSnapshot,
    startTime: booking.startTimeSnapshot.toISOString(),
    groupSize: booking.groupSize,
    status: booking.status,
    totalAmount: booking.totalAmount,
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
        include: { user: { select: { name: true } } },
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
    include: { user: { select: { name: true } } },
    orderBy: { startTimeSnapshot: "desc" },
    take: 50,
  });

  return bookings.map(mapBookingRow);
}

export async function ensureOperatorPayouts(operatorId: string) {
  const existing = await prisma.payout.count({ where: { operatorId } });
  if (existing > 0) {
    return;
  }

  const confirmed = await prisma.booking.aggregate({
    where: {
      listing: { operatorId },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    _sum: { totalAmount: true },
  });

  const gross = confirmed._sum.totalAmount ?? 0;
  const commission = Math.round(gross * PLATFORM_COMMISSION_RATE);
  const netAmount = gross - commission;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.payout.create({
    data: {
      operatorId,
      amount: gross,
      commission,
      netAmount,
      status: PayoutStatus.PENDING,
      periodStart: monthStart,
      periodEnd: now,
    },
  });
}

export async function getOperatorPayouts(
  operatorId: string
): Promise<OperatorPayoutRow[]> {
  await ensureOperatorPayouts(operatorId);

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
