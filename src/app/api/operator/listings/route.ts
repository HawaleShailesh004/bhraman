import { Difficulty, ListingStatus } from "@prisma/client";
import { ForbiddenError } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const DEFAULT_POLICY = {
  weatherRefundPct: 100,
  cutoffHours: 24,
  beforeCutoffPct: 100,
  afterCutoffPct: 50,
  noShowPct: 0,
};

type CreateListingBody = {
  title?: unknown;
  summary?: unknown;
  description?: unknown;
  placeId?: unknown;
  categoryId?: unknown;
  difficulty?: unknown;
  durationHours?: unknown;
  basePrice?: unknown;
  minGroupSize?: unknown;
  maxGroupSize?: unknown;
};

export async function POST(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;
  const { session } = auth;

  const body = (await request.json()) as CreateListingBody;

  if (
    typeof body.title !== "string" ||
    typeof body.summary !== "string" ||
    typeof body.placeId !== "string" ||
    typeof body.categoryId !== "string" ||
    typeof body.difficulty !== "string" ||
    typeof body.durationHours !== "number" ||
    typeof body.basePrice !== "number" ||
    typeof body.minGroupSize !== "number" ||
    typeof body.maxGroupSize !== "number"
  ) {
    return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  if (!Object.values(Difficulty).includes(body.difficulty as Difficulty)) {
    return Response.json({ error: "INVALID_DIFFICULTY" }, { status: 400 });
  }

  try {
    const baseSlug = slugify(body.title);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const listing = await prisma.listing.create({
      data: {
        slug,
        operatorId: session.operatorId,
        placeId: body.placeId,
        categoryId: body.categoryId,
        title: body.title,
        summary: body.summary,
        description:
          typeof body.description === "string" ? body.description : body.summary,
        difficulty: body.difficulty as Difficulty,
        durationHours: body.durationHours,
        basePrice: body.basePrice,
        minGroupSize: body.minGroupSize,
        maxGroupSize: body.maxGroupSize,
        inclusions: ["Guide", "Safety briefing"],
        exclusions: ["Personal gear"],
        thingsToCarry: ["Water bottle", "Comfortable shoes"],
        cancellationPolicy: DEFAULT_POLICY,
        status: ListingStatus.DRAFT,
      },
    });

    return Response.json({ id: listing.id, slug: listing.slug });
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      (error instanceof ForbiddenError
        ? Response.json({ error: "FORBIDDEN" }, { status: 403 })
        : Response.json({ error: "CREATE_FAILED" }, { status: 500 }))
    );
  }
}
