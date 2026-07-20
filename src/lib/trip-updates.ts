import "server-only";

import type { TripUpdateType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createTripUpdate(input: {
  operatorId: string;
  slotId: string;
  title: string;
  body: string;
  type?: TripUpdateType;
  pinned?: boolean;
}) {
  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: input.slotId, listing: { operatorId: input.operatorId } },
    select: { id: true },
  });
  if (!slot) throw new Error("SLOT_NOT_FOUND");

  return prisma.tripUpdate.create({
    data: {
      slotId: input.slotId,
      operatorId: input.operatorId,
      title: input.title.trim().slice(0, 160),
      body: input.body.trim().slice(0, 4000),
      type: input.type ?? "INFO",
      pinned: input.pinned ?? false,
    },
  });
}

export async function updateTripUpdate(input: {
  operatorId: string;
  updateId: string;
  title?: string;
  body?: string;
  type?: TripUpdateType;
  pinned?: boolean;
}) {
  const existing = await prisma.tripUpdate.findFirst({
    where: { id: input.updateId, operatorId: input.operatorId },
  });
  if (!existing) throw new Error("UPDATE_NOT_FOUND");

  return prisma.tripUpdate.update({
    where: { id: input.updateId },
    data: {
      ...(input.title !== undefined
        ? { title: input.title.trim().slice(0, 160) }
        : {}),
      ...(input.body !== undefined
        ? { body: input.body.trim().slice(0, 4000) }
        : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
    },
  });
}

export async function deleteTripUpdate(operatorId: string, updateId: string) {
  const existing = await prisma.tripUpdate.findFirst({
    where: { id: updateId, operatorId },
  });
  if (!existing) throw new Error("UPDATE_NOT_FOUND");
  await prisma.tripUpdate.delete({ where: { id: updateId } });
}

export async function markBookingUpdatesRead(bookingId: string) {
  await prisma.bookingUpdateRead.upsert({
    where: { bookingId },
    create: { bookingId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });
}
