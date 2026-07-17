import "server-only";

import { SlotStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type GenerateSlotsInput = {
  listingId: string;
  weekdays: number[];
  startTime: string;
  capacity: number;
  fromDate: string;
  toDate: string;
  priceOverride?: number | null;
  minSeatsToConfirm?: number | null;
};

function setTimeOfDay(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes ?? 0, 0, 0);
  return next;
}

export async function generateSlots(input: GenerateSlotsInput) {
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { durationHours: true },
  });

  if (!listing) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const fromDate = new Date(input.fromDate);
  const toDate = new Date(input.toDate);
  const slots: {
    listingId: string;
    startTime: Date;
    endTime: Date;
    capacity: number;
    bookedSeats: number;
    priceOverride: number | null;
    minSeatsToConfirm: number | null;
    status: SlotStatus;
  }[] = [];

  for (
    let cursor = new Date(fromDate);
    cursor <= toDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    if (!input.weekdays.includes(cursor.getDay())) {
      continue;
    }

    const start = setTimeOfDay(new Date(cursor), input.startTime);
    if (start < new Date()) {
      continue;
    }

    const end = new Date(start.getTime() + listing.durationHours * 3.6e6);
    slots.push({
      listingId: input.listingId,
      startTime: start,
      endTime: end,
      capacity: input.capacity,
      bookedSeats: 0,
      priceOverride: input.priceOverride ?? null,
      minSeatsToConfirm: input.minSeatsToConfirm ?? null,
      status: SlotStatus.OPEN,
    });
  }

  if (slots.length === 0) {
    return { created: 0 };
  }

  const result = await prisma.availabilitySlot.createMany({
    data: slots,
    skipDuplicates: true,
  });

  return { created: result.count };
}
