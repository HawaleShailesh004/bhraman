import {
  assertOwnsListing,
  ForbiddenError,
  getSessionOperator,
} from "@/lib/auth";
import { generateSlots } from "@/lib/availability-generator";

type AvailabilityBody = {
  listingId?: unknown;
  weekdays?: unknown;
  startTime?: unknown;
  capacity?: unknown;
  fromDate?: unknown;
  toDate?: unknown;
  priceOverride?: unknown;
};

export async function POST(request: Request) {
  const session = await getSessionOperator();
  if (!session) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await request.json()) as AvailabilityBody;

  if (
    typeof body.listingId !== "string" ||
    !Array.isArray(body.weekdays) ||
    !body.weekdays.every((day) => typeof day === "number") ||
    typeof body.startTime !== "string" ||
    typeof body.capacity !== "number" ||
    typeof body.fromDate !== "string" ||
    typeof body.toDate !== "string"
  ) {
    return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  try {
    await assertOwnsListing(session.userId, body.listingId);

    const result = await generateSlots({
      listingId: body.listingId,
      weekdays: body.weekdays as number[],
      startTime: body.startTime,
      capacity: body.capacity,
      fromDate: body.fromDate,
      toDate: body.toDate,
      priceOverride:
        typeof body.priceOverride === "number" ? body.priceOverride : null,
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "LISTING_NOT_FOUND") {
      return Response.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
    }
    return Response.json({ error: "GENERATION_FAILED" }, { status: 500 });
  }
}
