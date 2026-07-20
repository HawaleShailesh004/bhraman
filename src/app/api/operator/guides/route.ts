import { Gender } from "@prisma/client";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import { getOperatorGuides } from "@/lib/batches";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  try {
    const guides = await getOperatorGuides(auth.session.operatorId);
    return Response.json({ guides });
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
    if (typeof body.name !== "string" || !body.name.trim()) {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    const guide = await prisma.guide.create({
      data: {
        operatorId: auth.session.operatorId,
        name: body.name.trim().slice(0, 120),
        phone:
          typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : null,
        gender:
          typeof body.gender === "string" &&
          Object.values(Gender).includes(body.gender as Gender)
            ? (body.gender as Gender)
            : null,
        role:
          typeof body.role === "string" && body.role.trim()
            ? body.role.trim().slice(0, 80)
            : "Trek lead",
        phonePublic: body.phonePublic === true,
        active: body.active !== false,
      },
    });
    return Response.json(guide);
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
    const existing = await prisma.guide.findFirst({
      where: { id: body.id, operatorId: auth.session.operatorId },
    });
    if (!existing) {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const guide = await prisma.guide.update({
      where: { id: body.id },
      data: {
        ...(typeof body.name === "string"
          ? { name: body.name.trim().slice(0, 120) }
          : {}),
        ...(body.phone === null
          ? { phone: null }
          : typeof body.phone === "string"
            ? { phone: body.phone.trim().slice(0, 30) }
            : {}),
        ...(typeof body.role === "string"
          ? { role: body.role.trim().slice(0, 80) }
          : {}),
        ...(typeof body.phonePublic === "boolean"
          ? { phonePublic: body.phonePublic }
          : {}),
        ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      },
    });
    return Response.json(guide);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "UPDATE_FAILED" }, { status: 500 })
    );
  }
}
