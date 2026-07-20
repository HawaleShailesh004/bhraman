import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import { getOperatorVehicles } from "@/lib/batches";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  try {
    const vehicles = await getOperatorVehicles(auth.session.operatorId);
    return Response.json({ vehicles });
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "LIST_FAILED" }, { status: 500 })
    );
  }
}

export async function POST(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      typeof body.type !== "string" ||
      !body.type.trim() ||
      typeof body.plate !== "string" ||
      !body.plate.trim()
    ) {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    const vehicle = await prisma.vehicle.create({
      data: {
        operatorId: auth.session.operatorId,
        type: body.type.trim().slice(0, 80),
        plate: body.plate.trim().toUpperCase().slice(0, 20),
        capacity:
          typeof body.capacity === "number" ? body.capacity : null,
        notes:
          typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null,
        active: body.active !== false,
      },
    });
    return Response.json(vehicle);
  } catch (error) {
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
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.id !== "string") {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    const existing = await prisma.vehicle.findFirst({
      where: { id: body.id, operatorId: auth.session.operatorId },
    });
    if (!existing) {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const vehicle = await prisma.vehicle.update({
      where: { id: body.id },
      data: {
        ...(typeof body.type === "string"
          ? { type: body.type.trim().slice(0, 80) }
          : {}),
        ...(typeof body.plate === "string"
          ? { plate: body.plate.trim().toUpperCase().slice(0, 20) }
          : {}),
        ...(body.capacity === null
          ? { capacity: null }
          : typeof body.capacity === "number"
            ? { capacity: body.capacity }
            : {}),
        ...(body.notes === null
          ? { notes: null }
          : typeof body.notes === "string"
            ? { notes: body.notes.trim().slice(0, 500) }
            : {}),
        ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      },
    });
    return Response.json(vehicle);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
