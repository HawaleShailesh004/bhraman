import { requireSessionTraveler, UnauthorizedError } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { getTripHubByRef, markTripUpdatesRead } from "@/lib/trip-hub";

/**
 * Dynamic segment is named `id` to match `/api/bookings/[id]/dispute`.
 * Callers pass bookingRef (e.g. BHR-xxxxx) as the path param.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireSessionTraveler();
    const trip = await getTripHubByRef(params.id, session.userId);
    if (!trip) {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return Response.json(trip);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "LOAD_FAILED" }, { status: 500 })
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireSessionTraveler();
    const body = (await request.json()) as { action?: unknown };
    if (body.action === "mark_read") {
      await markTripUpdatesRead(params.id, session.userId);
      return Response.json({ ok: true });
    }
    return Response.json({ error: "INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
