import { DisputeActor } from "@prisma/client";
import {
  assertOwnsBooking,
  ForbiddenError,
  getSessionOperator,
} from "@/lib/auth";
import { EscrowError, openEscrowDispute } from "@/lib/escrow";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSessionOperator();
  if (!session) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as { reason?: unknown };
  if (typeof body.reason !== "string") {
    return Response.json({ error: "INVALID_REASON" }, { status: 400 });
  }

  try {
    await assertOwnsBooking(session.userId, params.id);
    return Response.json(
      await openEscrowDispute({
        bookingId: params.id,
        actor: DisputeActor.OPERATOR,
        reason: body.reason,
      }),
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    if (error instanceof EscrowError) {
      return Response.json({ error: error.code }, { status: 409 });
    }
    throw error;
  }
}
