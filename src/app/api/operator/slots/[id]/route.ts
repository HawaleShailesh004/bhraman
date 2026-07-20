import { SlotStatus } from "@prisma/client";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import {
  getOperatorBatchDetail,
  updateOperatorSlot,
} from "@/lib/batches";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const batch = await getOperatorBatchDetail(
      auth.session.operatorId,
      params.id,
    );
    if (!batch) {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return Response.json(batch);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "LOAD_FAILED" }, { status: 500 })
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      body.status !== undefined &&
      (typeof body.status !== "string" ||
        !Object.values(SlotStatus).includes(body.status as SlotStatus))
    ) {
      return Response.json({ error: "INVALID_STATUS" }, { status: 400 });
    }

    const updated = await updateOperatorSlot(
      auth.session.operatorId,
      params.id,
      {
        startTime:
          typeof body.startTime === "string" ? body.startTime : undefined,
        endTime: typeof body.endTime === "string" ? body.endTime : undefined,
        capacity:
          typeof body.capacity === "number" ? body.capacity : undefined,
        minSeatsToConfirm:
          body.minSeatsToConfirm === null
            ? null
            : typeof body.minSeatsToConfirm === "number"
              ? body.minSeatsToConfirm
              : undefined,
        status: body.status as SlotStatus | undefined,
        meetingPointOverride:
          body.meetingPointOverride === null
            ? null
            : typeof body.meetingPointOverride === "string"
              ? body.meetingPointOverride
              : undefined,
        pickupNote:
          body.pickupNote === null
            ? null
            : typeof body.pickupNote === "string"
              ? body.pickupNote
              : undefined,
        weatherNote:
          body.weatherNote === null
            ? null
            : typeof body.weatherNote === "string"
              ? body.weatherNote
              : undefined,
        assignedGuideId:
          body.assignedGuideId === null
            ? null
            : typeof body.assignedGuideId === "string"
              ? body.assignedGuideId
              : undefined,
        assignedVehicleId:
          body.assignedVehicleId === null
            ? null
            : typeof body.assignedVehicleId === "string"
              ? body.assignedVehicleId
              : undefined,
      },
    );
    return Response.json({ id: updated.id, status: updated.status });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SLOT_NOT_FOUND") {
        return Response.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      if (error.message === "CAPACITY_BELOW_BOOKED") {
        return Response.json({ error: "CAPACITY_BELOW_BOOKED" }, { status: 409 });
      }
      if (
        error.message === "GUIDE_NOT_FOUND" ||
        error.message === "VEHICLE_NOT_FOUND"
      ) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
