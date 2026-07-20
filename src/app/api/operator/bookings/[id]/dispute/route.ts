import { DisputeActor } from "@prisma/client";
import { assertOwnsBooking } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { EscrowError, openEscrowDispute } from "@/lib/escrow";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

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
    const mapped = toApiErrorResponse(error);
    if (mapped) return mapped;
    if (error instanceof EscrowError) {
      return Response.json({ error: error.code }, { status: 409 });
    }
    return Response.json({ error: "DISPUTE_FAILED" }, { status: 500 });
  }
}
