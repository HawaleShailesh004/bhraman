import "server-only";

import { prisma } from "@/lib/prisma";
import { getCatalogListingBySlug } from "@/lib/seed-catalog";
import type { AvailabilitySlotData } from "@/types/listing";

function generateMockSlots(listingId: string, durationHours: number, capacity: number) {
  const slots: AvailabilitySlotData[] = [];
  const now = new Date();

  for (let i = 1; i <= 70; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const weekday = day.getDay();
    if (weekday !== 0 && weekday !== 6) continue;

    const start = new Date(day);
    start.setHours(6, 0, 0, 0);
    const end = new Date(start.getTime() + durationHours * 3_600_000);

    slots.push({
      id: `${listingId}-${start.toISOString()}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      capacity,
      bookedSeats: 0,
      confirmedSeats: 0,
      seatsLeft: capacity,
      maleCount: 0,
      femaleCount: 0,
      otherCount: 0,
      minSeatsToConfirm: null,
      status: "OPEN",
    });
  }

  return slots;
}

async function dbHasPublishedListings() {
  try {
    const count = await prisma.listing.count({ where: { status: "PUBLISHED" } });
    return count > 0;
  } catch {
    return false;
  }
}

export async function getListingAvailability(slug: string) {
  if (!(await dbHasPublishedListings())) {
    const listing = getCatalogListingBySlug(slug);
    if (!listing) return [];
    return generateMockSlots(listing.id, listing.durationHours, listing.maxGroupSize);
  }

  const listing = await prisma.listing.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!listing) return [];

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      listingId: listing.id,
      status: { in: ["OPEN", "FILLING_FAST", "CONFIRMED"] },
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    take: 20,
    select: {
      id: true,
      startTime: true,
      endTime: true,
      capacity: true,
      bookedSeats: true,
      maleCount: true,
      femaleCount: true,
      otherCount: true,
      minSeatsToConfirm: true,
      priceOverride: true,
      status: true,
    },
  });

  const confirmedBySlot = await prisma.booking.groupBy({
    by: ["slotId"],
    where: {
      slotId: { in: slots.map((slot) => slot.id) },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    _sum: { groupSize: true },
  });
  const confirmedSeats = new Map(
    confirmedBySlot.map((row) => [row.slotId, row._sum.groupSize ?? 0]),
  );

  return slots.map((slot) => ({
    id: slot.id,
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
    capacity: slot.capacity,
    bookedSeats: slot.bookedSeats,
    confirmedSeats: confirmedSeats.get(slot.id) ?? 0,
    seatsLeft: Math.max(slot.capacity - slot.bookedSeats, 0),
    maleCount: slot.maleCount,
    femaleCount: slot.femaleCount,
    otherCount: slot.otherCount,
    minSeatsToConfirm: slot.minSeatsToConfirm,
    status: slot.status,
    priceOverride: slot.priceOverride,
  }));
}
