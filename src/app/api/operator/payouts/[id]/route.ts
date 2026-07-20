import { ForbiddenError } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  try {
    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
    });

    if (!payout || payout.operatorId !== session.operatorId) {
      throw new ForbiddenError();
    }

    return Response.json(
      {
        error: "PAYOUT_MANAGED_BY_PLATFORM",
        message: "Payout status can only be changed by the platform.",
      },
      { status: 409 },
    );
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
