import "server-only";

import type { AgeBand, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db";
import { markBookingUpdatesRead } from "@/lib/trip-updates";
import type { TripHubData } from "@/types/trip";

function firstName(full: string) {
  return full.trim().split(/\s+/)[0] || full;
}

function ageBandCounts(
  participants: { ageBand: AgeBand | null }[],
): Partial<Record<AgeBand, number>> {
  const counts: Partial<Record<AgeBand, number>> = {};
  for (const p of participants) {
    if (!p.ageBand) continue;
    counts[p.ageBand] = (counts[p.ageBand] ?? 0) + 1;
  }
  return counts;
}

export async function getTripHubByRef(
  bookingRef: string,
  userId: string,
): Promise<TripHubData | null> {
  return withDbFallback(async () => {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        participants: { orderBy: { createdAt: "asc" } },
        updateRead: true,
        listing: {
          select: {
            slug: true,
            meetingPoint: true,
            inclusions: true,
            thingsToCarry: true,
            place: { select: { name: true } },
          },
        },
        slot: {
          include: {
            guide: {
              select: {
                name: true,
                phone: true,
                phonePublic: true,
                role: true,
              },
            },
            vehicle: {
              select: { type: true, plate: true, capacity: true },
            },
            updates: {
              orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
            },
            bookings: {
              where: {
                status: { in: ["CONFIRMED", "COMPLETED"] },
              },
              include: {
                participants: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!booking || booking.userId !== userId) return null;

    const slot = booking.slot;
    const showRoster =
      booking.status === "CONFIRMED" || booking.status === "COMPLETED";

    const allParticipants: { ageBand: AgeBand | null }[] =
      slot.bookings.flatMap((b) =>
        b.participants.length > 0
          ? b.participants.map((p) => ({ ageBand: p.ageBand }))
          : [{ ageBand: null }],
      );

    const coTravelers = showRoster
      ? slot.bookings
          .filter((b) => b.id !== booking.id)
          .flatMap((b) =>
            (b.participants.length > 0
              ? b.participants.map((p) => ({
                  name: p.name,
                  gender: p.gender,
                  ageBand: p.ageBand,
                }))
              : [
                  {
                    name: b.user.name,
                    gender: null as Gender | null,
                    ageBand: null as AgeBand | null,
                  },
                ]
            ).map((p) => ({
              firstName: firstName(p.name),
              gender: p.gender,
              ageBand: p.ageBand,
            })),
          )
      : null;

    const latestUpdate = slot.updates[0]?.createdAt ?? null;
    const lastRead = booking.updateRead?.lastReadAt ?? null;
    const hasUnreadUpdates = Boolean(
      latestUpdate && (!lastRead || latestUpdate > lastRead),
    );

    return {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      status: booking.status,
      groupSize: booking.groupSize,
      listingTitle: booking.listingTitleSnapshot,
      listingSlug: booking.listing.slug,
      placeName: booking.listing.place.name,
      meetingPoint:
        slot.meetingPointOverride || booking.listing.meetingPoint,
      pickupNote: slot.pickupNote,
      weatherNote: slot.weatherNote,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      slotStatus: slot.status,
      capacity: slot.capacity,
      bookedSeats: slot.bookedSeats,
      seatsLeft: Math.max(slot.capacity - slot.bookedSeats, 0),
      maleCount: slot.maleCount,
      femaleCount: slot.femaleCount,
      otherCount: slot.otherCount,
      ageBandCounts: ageBandCounts(allParticipants),
      minSeatsToConfirm: slot.minSeatsToConfirm,
      inclusions: booking.listing.inclusions,
      thingsToCarry: booking.listing.thingsToCarry,
      guide: slot.guide
        ? {
            name: slot.guide.name,
            phone: slot.guide.phonePublic ? slot.guide.phone : null,
            role: slot.guide.role,
          }
        : null,
      vehicle: slot.vehicle
        ? {
            type: slot.vehicle.type,
            plate: slot.vehicle.plate,
            capacity: slot.vehicle.capacity,
          }
        : null,
      coTravelers,
      updates: slot.updates.map((u) => ({
        id: u.id,
        title: u.title,
        body: u.body,
        type: u.type,
        pinned: u.pinned,
        createdAt: u.createdAt.toISOString(),
      })),
      hasUnreadUpdates,
      participants: booking.participants.map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        ageBand: p.ageBand,
      })),
    };
  }, null);
}

export async function markTripUpdatesRead(bookingRef: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingRef },
    select: { id: true, userId: true },
  });
  if (!booking || booking.userId !== userId) throw new Error("FORBIDDEN");
  await markBookingUpdatesRead(booking.id);
}
