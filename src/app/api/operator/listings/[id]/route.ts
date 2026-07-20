import { ListingStatus } from "@prisma/client";
import { assertOwnsListing } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { prisma } from "@/lib/prisma";

type UpdateListingBody = {
  status?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const body = (await request.json()) as UpdateListingBody;
  if (typeof body.status !== "string") {
    return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  if (!Object.values(ListingStatus).includes(body.status as ListingStatus)) {
    return Response.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  try {
    await assertOwnsListing(session.userId, params.id);

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: { status: body.status as ListingStatus },
      select: { id: true, status: true, slug: true },
    });

    return Response.json(listing);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
