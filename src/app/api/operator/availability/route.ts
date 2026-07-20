import { assertOwnsListing } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { generateSlots } from "@/lib/availability-generator";

type AvailabilityBody = {
  listingId?: unknown;
  weekdays?: unknown;
  startTime?: unknown;
  capacity?: unknown;
  fromDate?: unknown;
  toDate?: unknown;
  priceOverride?: unknown;
  minSeatsToConfirm?: unknown;
};

export async function POST(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

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
  if (
    body.minSeatsToConfirm !== undefined &&
    (typeof body.minSeatsToConfirm !== "number" ||
      !Number.isInteger(body.minSeatsToConfirm) ||
      body.minSeatsToConfirm < 1 ||
      body.minSeatsToConfirm > body.capacity)
  ) {
    return Response.json(
      { error: "INVALID_MINIMUM_SEATS" },
      { status: 400 },
    );
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
      minSeatsToConfirm:
        typeof body.minSeatsToConfirm === "number"
          ? body.minSeatsToConfirm
          : null,
    });

    return Response.json(result);
  } catch (error) {
    const mapped = toApiErrorResponse(error);
    if (mapped) return mapped;
    if (error instanceof Error && error.message === "LISTING_NOT_FOUND") {
      return Response.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
    }
    return Response.json({ error: "GENERATION_FAILED" }, { status: 500 });
  }
}
