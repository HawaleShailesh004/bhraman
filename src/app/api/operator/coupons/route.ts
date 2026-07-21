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

  const {
    code,
    label,
    discountType,
    discountValue,
    minBookingInr,
    maxUses,
    validUntil,
    listingIds,
  } = body;

  if (
    typeof code !== "string" ||
    typeof discountType !== "string" ||
    !Object.values(CouponDiscountType).includes(
      discountType as CouponDiscountType,
    ) ||
    typeof discountValue !== "number"
  ) {
    return Response.json({ error: "Invalid coupon payload." }, { status: 400 });
  }

  const parsedDiscountType = discountType as CouponDiscountType;

  try {
    const coupon = await withDb(() =>
      createOperatorCoupon(auth.session.operatorId, {
        code,
        label: typeof label === "string" ? label : null,
        discountType: parsedDiscountType,
        discountValue,
        minBookingInr: typeof minBookingInr === "number" ? minBookingInr : 0,
        maxUses: typeof maxUses === "number" ? maxUses : null,
        validUntil: typeof validUntil === "string" ? new Date(validUntil) : null,
        listingIds: Array.isArray(listingIds)
          ? listingIds.filter((id): id is string => typeof id === "string")
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

  const { id, active } = body;

  if (typeof id !== "string" || typeof active !== "boolean") {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await withDb(() => setCouponActive(auth.session.operatorId, id, active));
    return Response.json({ ok: true });
  } catch (error) {
    return toApiErrorResponseOrInternal(error);
  }
}
