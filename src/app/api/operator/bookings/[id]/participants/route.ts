import { AgeBand, Gender } from "@prisma/client";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import { recomputeSlotComposition } from "@/lib/batches";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        listing: { operatorId: auth.session.operatorId },
      },
      select: { id: true, slotId: true, groupSize: true },
    });
    if (!booking) {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const body = (await request.json()) as {
      participants?: unknown;
    };
    if (!Array.isArray(body.participants)) {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    const participants = body.participants
      .map((raw) => {
        if (!raw || typeof raw !== "object") return null;
        const p = raw as Record<string, unknown>;
        if (typeof p.name !== "string" || !p.name.trim()) return null;
        return {
          name: p.name.trim().slice(0, 120),
          gender:
            typeof p.gender === "string" &&
            Object.values(Gender).includes(p.gender as Gender)
              ? (p.gender as Gender)
              : null,
          ageBand:
            typeof p.ageBand === "string" &&
            Object.values(AgeBand).includes(p.ageBand as AgeBand)
              ? (p.ageBand as AgeBand)
              : null,
          age:
            typeof p.age === "number" && p.age >= 1 && p.age <= 120
              ? p.age
              : null,
          checkInAt:
            p.checkIn === true
              ? new Date()
              : p.checkIn === false
                ? null
                : undefined,
        };
      })
      .filter(Boolean) as {
      name: string;
      gender: Gender | null;
      ageBand: AgeBand | null;
      age: number | null;
      checkInAt?: Date | null;
    }[];

    if (!participants.length) {
      return Response.json({ error: "EMPTY_PARTICIPANTS" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookingParticipant.deleteMany({
        where: { bookingId: booking.id },
      });
      await tx.bookingParticipant.createMany({
        data: participants.map((p) => ({
          bookingId: booking.id,
          name: p.name,
          gender: p.gender,
          ageBand: p.ageBand,
          age: p.age,
          checkInAt: p.checkInAt === undefined ? undefined : p.checkInAt,
        })),
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: { groupSize: participants.length },
      });
      await recomputeSlotComposition(booking.slotId, tx);
    });

    return Response.json({ ok: true, count: participants.length });
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
