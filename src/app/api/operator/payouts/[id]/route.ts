import { ForbiddenError, getSessionOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSessionOperator();
  if (!session) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

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
    if (error instanceof ForbiddenError) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return Response.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
