import "server-only";

import type { AgeBand, Gender, Prisma, SlotStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db";
import type {
  OperatorBatchDetail,
  OperatorBatchListItem,
  OperatorGuideRow,
  OperatorVehicleRow,
} from "@/types/batch";

function seatsLeft(capacity: number, booked: number) {
  return Math.max(capacity - booked, 0);
}

function ageBandCountsFromParticipants(
  participants: { ageBand: AgeBand | null }[],
): Partial<Record<AgeBand, number>> {
  const counts: Partial<Record<AgeBand, number>> = {};
  for (const p of participants) {
    if (!p.ageBand) continue;
    counts[p.ageBand] = (counts[p.ageBand] ?? 0) + 1;
  }
  return counts;
}

export function genderDelta(gender: Gender | null | undefined): {
  male: number;
  female: number;
  other: number;
} {
  if (gender === "MALE") return { male: 1, female: 0, other: 0 };
  if (gender === "FEMALE") return { male: 0, female: 1, other: 0 };
  if (gender === "OTHER" || gender === "PREFER_NOT_TO_SAY") {
    return { male: 0, female: 0, other: 1 };
  }
  return { male: 0, female: 0, other: 0 };
}

/** Recompute slot gender counters from all active participants on the slot. */
export async function recomputeSlotComposition(
  slotId: string,
  tx?: Prisma.TransactionClient,
) {
  const db = tx ?? prisma;
  const bookings = await db.booking.findMany({
    where: {
      slotId,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    include: { participants: true },
  });

  let maleCount = 0;
  let femaleCount = 0;
  let otherCount = 0;
  let bookedSeats = 0;

  for (const booking of bookings) {
    bookedSeats += booking.groupSize;
    if (booking.participants.length > 0) {
      for (const p of booking.participants) {
        const d = genderDelta(p.gender);
        maleCount += d.male;
        femaleCount += d.female;
        otherCount += d.other;
      }
    } else {
      const d = genderDelta(booking.customerGender);
      maleCount += d.male * booking.groupSize;
      femaleCount += d.female * booking.groupSize;
      otherCount += d.other * booking.groupSize;
    }
  }

  const slot = await db.availabilitySlot.findUniqueOrThrow({
    where: { id: slotId },
    select: { capacity: true, minSeatsToConfirm: true, status: true },
  });

  let status = slot.status;
  if (status !== "CANCELLED" && status !== "COMPLETED") {
    if (bookedSeats >= slot.capacity) status = "FULL";
    else if (
      slot.minSeatsToConfirm &&
      bookedSeats >= slot.minSeatsToConfirm
    ) {
      status = "CONFIRMED";
    } else if (bookedSeats >= Math.ceil(slot.capacity * 0.7)) {
      status = "FILLING_FAST";
    } else if (status === "FULL" || status === "FILLING_FAST") {
      status = "OPEN";
    }
  }

  await db.availabilitySlot.update({
    where: { id: slotId },
    data: { maleCount, femaleCount, otherCount, bookedSeats, status },
  });
}

export async function getOperatorBatches(
  operatorId: string,
): Promise<OperatorBatchListItem[]> {
  return withDbFallback(async () => {
    const slots = await prisma.availabilitySlot.findMany({
      where: { listing: { operatorId } },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        guide: { select: { name: true } },
        vehicle: { select: { type: true, plate: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startTime: "asc" },
      take: 80,
    });

    return slots.map((slot) => ({
      id: slot.id,
      listingId: slot.listing.id,
      listingTitle: slot.listing.title,
      listingSlug: slot.listing.slug,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      capacity: slot.capacity,
      bookedSeats: slot.bookedSeats,
      seatsLeft: seatsLeft(slot.capacity, slot.bookedSeats),
      maleCount: slot.maleCount,
      femaleCount: slot.femaleCount,
      otherCount: slot.otherCount,
      minSeatsToConfirm: slot.minSeatsToConfirm,
      status: slot.status,
      guideName: slot.guide?.name ?? null,
      vehicleLabel: slot.vehicle
        ? `${slot.vehicle.type} · ${slot.vehicle.plate}`
        : null,
      bookingCount: slot._count.bookings,
    }));
  }, []);
}

export async function getOperatorBatchDetail(
  operatorId: string,
  slotId: string,
): Promise<OperatorBatchDetail | null> {
  return withDbFallback(async () => {
    await backfillMissingParticipants(slotId);

    const slot = await prisma.availabilitySlot.findFirst({
      where: { id: slotId, listing: { operatorId } },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            meetingPoint: true,
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            phone: true,
            phonePublic: true,
            role: true,
          },
        },
        vehicle: {
          select: { id: true, type: true, plate: true, capacity: true },
        },
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
            },
          },
          include: {
            user: { select: { name: true, email: true } },
            participants: { orderBy: { createdAt: "asc" } },
          },
          orderBy: { createdAt: "asc" },
        },
        updates: { orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
      },
    });

    if (!slot) return null;

    const allParticipants = slot.bookings.flatMap((b) => b.participants);

    return {
      id: slot.id,
      listingId: slot.listing.id,
      listingTitle: slot.listing.title,
      listingSlug: slot.listing.slug,
      listingMeetingPoint: slot.listing.meetingPoint,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      capacity: slot.capacity,
      bookedSeats: slot.bookedSeats,
      seatsLeft: seatsLeft(slot.capacity, slot.bookedSeats),
      maleCount: slot.maleCount,
      femaleCount: slot.femaleCount,
      otherCount: slot.otherCount,
      ageBandCounts: ageBandCountsFromParticipants(allParticipants),
      minSeatsToConfirm: slot.minSeatsToConfirm,
      status: slot.status,
      meetingPointOverride: slot.meetingPointOverride,
      pickupNote: slot.pickupNote,
      weatherNote: slot.weatherNote,
      assignedGuideId: slot.assignedGuideId,
      assignedVehicleId: slot.assignedVehicleId,
      guide: slot.guide,
      vehicle: slot.vehicle,
      bookings: slot.bookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        travelerName: b.user.name,
        travelerEmail: b.user.email,
        customerPhone: b.customerPhone,
        customerGender: b.customerGender,
        groupSize: b.groupSize,
        status: b.status,
        source: b.source,
        emergencyContactName: b.emergencyContactName,
        emergencyContactPhone: b.emergencyContactPhone,
        medicalNotes: b.medicalNotes,
        participants: b.participants.map((p) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          ageBand: p.ageBand,
          age: p.age,
          checkInAt: p.checkInAt?.toISOString() ?? null,
        })),
      })),
      updates: slot.updates.map((u) => ({
        id: u.id,
        title: u.title,
        body: u.body,
        type: u.type,
        pinned: u.pinned,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }, null);
}

export type UpdateSlotInput = {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  minSeatsToConfirm?: number | null;
  status?: SlotStatus;
  meetingPointOverride?: string | null;
  pickupNote?: string | null;
  weatherNote?: string | null;
  assignedGuideId?: string | null;
  assignedVehicleId?: string | null;
};

export async function updateOperatorSlot(
  operatorId: string,
  slotId: string,
  input: UpdateSlotInput,
) {
  const existing = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, listing: { operatorId } },
    select: { id: true, capacity: true, bookedSeats: true },
  });
  if (!existing) throw new Error("SLOT_NOT_FOUND");

  if (
    input.capacity !== undefined &&
    input.capacity < existing.bookedSeats
  ) {
    throw new Error("CAPACITY_BELOW_BOOKED");
  }

  if (input.assignedGuideId) {
    const guide = await prisma.guide.findFirst({
      where: { id: input.assignedGuideId, operatorId, active: true },
    });
    if (!guide) throw new Error("GUIDE_NOT_FOUND");
  }
  if (input.assignedVehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: input.assignedVehicleId, operatorId, active: true },
    });
    if (!vehicle) throw new Error("VEHICLE_NOT_FOUND");
  }

  return prisma.availabilitySlot.update({
    where: { id: slotId },
    data: {
      ...(input.startTime ? { startTime: new Date(input.startTime) } : {}),
      ...(input.endTime ? { endTime: new Date(input.endTime) } : {}),
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      ...(input.minSeatsToConfirm !== undefined
        ? { minSeatsToConfirm: input.minSeatsToConfirm }
        : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.meetingPointOverride !== undefined
        ? { meetingPointOverride: input.meetingPointOverride }
        : {}),
      ...(input.pickupNote !== undefined
        ? { pickupNote: input.pickupNote }
        : {}),
      ...(input.weatherNote !== undefined
        ? { weatherNote: input.weatherNote }
        : {}),
      ...(input.assignedGuideId !== undefined
        ? { assignedGuideId: input.assignedGuideId }
        : {}),
      ...(input.assignedVehicleId !== undefined
        ? { assignedVehicleId: input.assignedVehicleId }
        : {}),
    },
  });
}

export async function getOperatorGuides(
  operatorId: string,
): Promise<OperatorGuideRow[]> {
  return withDbFallback(async () => {
    const guides = await prisma.guide.findMany({
      where: { operatorId },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });
    return guides.map((g) => ({
      id: g.id,
      name: g.name,
      phone: g.phone,
      gender: g.gender,
      role: g.role,
      phonePublic: g.phonePublic,
      active: g.active,
    }));
  }, []);
}

export async function getOperatorVehicles(
  operatorId: string,
): Promise<OperatorVehicleRow[]> {
  return withDbFallback(async () => {
    const vehicles = await prisma.vehicle.findMany({
      where: { operatorId },
      orderBy: [{ active: "desc" }, { type: "asc" }],
    });
    return vehicles.map((v) => ({
      id: v.id,
      type: v.type,
      plate: v.plate,
      capacity: v.capacity,
      notes: v.notes,
      active: v.active,
    }));
  }, []);
}

/** Backfill one participant from lead fields when a booking has none. */
export async function backfillMissingParticipants(slotId?: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      ...(slotId ? { slotId } : {}),
      participants: { none: {} },
    },
    include: { user: { select: { name: true } } },
    take: 200,
  });

  for (const booking of bookings) {
    await prisma.bookingParticipant.create({
      data: {
        bookingId: booking.id,
        name: booking.user.name,
        gender: booking.customerGender,
      },
    });
  }

  if (slotId && bookings.length > 0) {
    await recomputeSlotComposition(slotId);
  }

  return { backfilled: bookings.length };
}
