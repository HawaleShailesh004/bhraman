import { DisputeActor } from "@prisma/client";
import { requireSessionTraveler, UnauthorizedError } from "@/lib/auth";
import { EscrowError, openEscrowDispute } from "@/lib/escrow";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  let session;
  try {
    session = await requireSessionTraveler();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw error;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });
  if (!booking || booking.userId !== session.userId) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = (await request.json()) as { reason?: unknown };
  if (typeof body.reason !== "string") {
    return Response.json({ error: "INVALID_REASON" }, { status: 400 });
  }

  try {
    return Response.json(
      await openEscrowDispute({
        bookingId: params.id,
        actor: DisputeActor.TRAVELER,
        reason: body.reason,
      }),
    );
  } catch (error) {
    if (error instanceof EscrowError) {
      return Response.json({ error: error.code }, { status: 409 });
    }
    throw error;
  }
}
