import { TripUpdateType } from "@prisma/client";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import {
  createTripUpdate,
  deleteTripUpdate,
  updateTripUpdate,
} from "@/lib/trip-updates";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      title?: unknown;
      body?: unknown;
      type?: unknown;
      pinned?: unknown;
    };
    if (typeof body.title !== "string" || typeof body.body !== "string") {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    if (
      body.type !== undefined &&
      (typeof body.type !== "string" ||
        !Object.values(TripUpdateType).includes(body.type as TripUpdateType))
    ) {
      return Response.json({ error: "INVALID_TYPE" }, { status: 400 });
    }

    const update = await createTripUpdate({
      operatorId: auth.session.operatorId,
      slotId: params.id,
      title: body.title,
      body: body.body,
      type: body.type as TripUpdateType | undefined,
      pinned: typeof body.pinned === "boolean" ? body.pinned : undefined,
    });
    return Response.json(update);
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_NOT_FOUND") {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "CREATE_FAILED" }, { status: 500 })
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      updateId?: unknown;
      title?: unknown;
      body?: unknown;
      type?: unknown;
      pinned?: unknown;
    };
    if (typeof body.updateId !== "string") {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    const update = await updateTripUpdate({
      operatorId: auth.session.operatorId,
      updateId: body.updateId,
      title: typeof body.title === "string" ? body.title : undefined,
      body: typeof body.body === "string" ? body.body : undefined,
      type:
        typeof body.type === "string" &&
        Object.values(TripUpdateType).includes(body.type as TripUpdateType)
          ? (body.type as TripUpdateType)
          : undefined,
      pinned: typeof body.pinned === "boolean" ? body.pinned : undefined,
    });
    return Response.json(update);
  } catch (error) {
    if (error instanceof Error && error.message === "UPDATE_NOT_FOUND") {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { updateId?: unknown };
    if (typeof body.updateId !== "string") {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    await deleteTripUpdate(auth.session.operatorId, body.updateId);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UPDATE_NOT_FOUND") {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "DELETE_FAILED" }, { status: 500 })
    );
  }
}
