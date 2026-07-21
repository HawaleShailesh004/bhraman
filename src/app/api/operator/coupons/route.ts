import { toApiErrorResponse, toApiErrorResponseOrInternal } from "@/lib/api-errors";
import { loadOperatorSession } from "@/app/api/operator/helpers";
import {
  createOperatorCoupon,
  listOperatorCoupons,
  setCouponActive,
} from "@/lib/coupons";
import { withDb } from "@/lib/db";
import { CouponDiscountType } from "@prisma/client";

export async function GET() {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const coupons = await withDb(() =>
      listOperatorCoupons(auth.session.operatorId),
    );
    return Response.json(coupons);
  } catch (error) {
    return toApiErrorResponseOrInternal(error);
  }
}

export async function POST(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  const body = (await request.json()) as {
    code?: unknown;
    label?: unknown;
    discountType?: unknown;
    discountValue?: unknown;
    minBookingInr?: unknown;
    maxUses?: unknown;
    validUntil?: unknown;
    listingIds?: unknown;
  };

  if (
    typeof body.code !== "string" ||
    typeof body.discountType !== "string" ||
    !Object.values(CouponDiscountType).includes(
      body.discountType as CouponDiscountType,
    ) ||
    typeof body.discountValue !== "number"
  ) {
    return Response.json({ error: "Invalid coupon payload." }, { status: 400 });
  }

  try {
    const coupon = await withDb(() =>
      createOperatorCoupon(auth.session.operatorId, {
        code: body.code,
        label: typeof body.label === "string" ? body.label : null,
        discountType: body.discountType as CouponDiscountType,
        discountValue: body.discountValue,
        minBookingInr:
          typeof body.minBookingInr === "number" ? body.minBookingInr : 0,
        maxUses: typeof body.maxUses === "number" ? body.maxUses : null,
        validUntil:
          typeof body.validUntil === "string"
            ? new Date(body.validUntil)
            : null,
        listingIds: Array.isArray(body.listingIds)
          ? body.listingIds.filter((id): id is string => typeof id === "string")
          : [],
      }),
    );
    return Response.json(coupon, { status: 201 });
  } catch (error) {
    const known = toApiErrorResponse(error);
    if (known) return known;
    return Response.json(
      { error: "Could not create coupon. Code may already exist." },
      { status: 409 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  const body = (await request.json()) as {
    id?: unknown;
    active?: unknown;
  };

  if (typeof body.id !== "string" || typeof body.active !== "boolean") {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await withDb(() =>
      setCouponActive(auth.session.operatorId, body.id as string, body.active),
    );
    return Response.json({ ok: true });
  } catch (error) {
    return toApiErrorResponseOrInternal(error);
  }
}
