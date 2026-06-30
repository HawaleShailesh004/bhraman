import { ListingStatus } from "@prisma/client";
import {
  assertOwnsListing,
  ForbiddenError,
  getSessionOperator,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UpdateListingBody = {
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
    if (error instanceof ForbiddenError) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return Response.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}
