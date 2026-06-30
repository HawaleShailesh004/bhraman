import { PayoutStatus } from "@prisma/client";
import { ForbiddenError, getSessionOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_FLOW: Record<PayoutStatus, PayoutStatus | null> = {
  PENDING: PayoutStatus.PROCESSING,
  PROCESSING: PayoutStatus.PAID,
  PAID: null,
  FAILED: PayoutStatus.PROCESSING,
};

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

    const nextStatus = STATUS_FLOW[payout.status];
    if (!nextStatus) {
      return Response.json({ error: "ALREADY_SETTLED" }, { status: 409 });
    }

    const updated = await prisma.payout.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        referenceId:
          nextStatus === PayoutStatus.PAID
            ? `RZP-ROUTE-${Date.now().toString(36).toUpperCase()}`
            : payout.referenceId,
      },
    });

    return Response.json({
      id: updated.id,
      status: updated.status,
      referenceId: updated.referenceId,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return Response.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
