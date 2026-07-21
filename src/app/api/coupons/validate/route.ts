import { validateCoupon } from "@/lib/coupons";
import { toApiErrorResponseOrInternal } from "@/lib/api-errors";
import { withDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    code?: unknown;
    listingId?: unknown;
    groupSize?: unknown;
  };

  if (
    typeof body.code !== "string" ||
    typeof body.listingId !== "string" ||
    typeof body.groupSize !== "number"
  ) {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const listing = await withDb(() =>
      prisma.listing.findUnique({
        where: { id: body.listingId as string },
        select: { id: true, operatorId: true, basePrice: true },
      }),
    );
    if (!listing) {
      return Response.json({ error: "Listing not found." }, { status: 404 });
    }

    const subtotalInr = listing.basePrice * body.groupSize;
    const result = await withDb(() =>
      validateCoupon({
        code: body.code,
        listingId: listing.id,
        operatorId: listing.operatorId,
        subtotalInr,
      }),
    );

    if (!result.ok) {
      return Response.json({ ok: false, message: result.message }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    return toApiErrorResponseOrInternal(error);
  }
}
