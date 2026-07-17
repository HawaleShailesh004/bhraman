import {
  assertOwnsBooking,
  ForbiddenError,
  getSessionOperator,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UpdateBookingBody = {
  status?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSessionOperator();
  if (!session) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateBookingBody;
  if (body.status !== "COMPLETED") {
    return Response.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  try {
    await assertOwnsBooking(session.userId, params.id);

    const existing = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        slot: { select: { endTime: true } },
      },
    });

    if (!existing || existing.status !== "CONFIRMED") {
      return Response.json({ error: "INVALID_TRANSITION" }, { status: 409 });
    }
    if (existing.slot.endTime > new Date()) {
      return Response.json({ error: "TRIP_NOT_ENDED" }, { status: 409 });
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "COMPLETED" },
      select: { id: true, status: true, bookingRef: true },
    });

    return Response.json(booking);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return Response.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
