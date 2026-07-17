import { requireSessionAdmin, UnauthorizedError } from "@/lib/auth";
import { EscrowError, resolveEscrowDispute } from "@/lib/escrow";

type ResolveBody = {
  resolution?: unknown;
  refundAmount?: unknown;
  note?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireSessionAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    throw error;
  }

  const body = (await request.json()) as ResolveBody;
  if (
    (body.resolution !== "RELEASE" &&
      body.resolution !== "REFUND" &&
      body.resolution !== "PARTIAL") ||
    typeof body.note !== "string" ||
    body.note.trim().length < 5 ||
    (body.resolution === "PARTIAL" &&
      (typeof body.refundAmount !== "number" ||
        !Number.isInteger(body.refundAmount)))
  ) {
    return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  try {
    return Response.json(
      await resolveEscrowDispute({
        paymentId: params.id,
        resolution: body.resolution,
        refundAmount:
          typeof body.refundAmount === "number"
            ? body.refundAmount
            : undefined,
        note: body.note,
      }),
    );
  } catch (error) {
    if (error instanceof EscrowError) {
      return Response.json({ error: error.code }, { status: 409 });
    }
    if (
      error instanceof Error &&
      (error.message === "RAZORPAY_NOT_CONFIGURED" ||
        error.message === "PAYMENT_ID_MISSING")
    ) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    return Response.json({ error: "RESOLUTION_FAILED" }, { status: 500 });
  }
}
