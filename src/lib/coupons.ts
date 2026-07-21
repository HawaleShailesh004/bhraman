import "server-only";

import { CouponDiscountType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CouponValidationInput = {
  code: string;
  listingId: string;
  operatorId: string;
  subtotalInr: number;
};

export type CouponValidationResult =
  | {
      ok: true;
      couponId: string;
      code: string;
      discountInr: number;
      message: string;
    }
  | { ok: false; message: string };

function computeDiscount(
  subtotal: number,
  type: CouponDiscountType,
  value: number,
) {
  if (type === "PERCENT") {
    return Math.min(subtotal, Math.round((subtotal * value) / 100));
  }
  return Math.min(subtotal, value);
}

export async function validateCoupon(
  input: CouponValidationInput,
): Promise<CouponValidationResult> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a coupon code." };

  const coupon = await prisma.couponCode.findFirst({
    where: {
      operatorId: input.operatorId,
      code,
      active: true,
    },
  });

  if (!coupon) return { ok: false, message: "Invalid or expired coupon." };

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { ok: false, message: "This coupon is not active yet." };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { ok: false, message: "This coupon has expired." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: "This coupon has reached its usage limit." };
  }
  if (input.subtotalInr < coupon.minBookingInr) {
    return {
      ok: false,
      message: `Minimum booking ${coupon.minBookingInr} required for this coupon.`,
    };
  }
  if (
    coupon.listingIds.length > 0 &&
    !coupon.listingIds.includes(input.listingId)
  ) {
    return { ok: false, message: "Coupon not valid for this trip." };
  }

  const discountInr = computeDiscount(
    input.subtotalInr,
    coupon.discountType,
    coupon.discountValue,
  );
  if (discountInr <= 0) {
    return { ok: false, message: "Coupon does not apply to this booking." };
  }

  return {
    ok: true,
    couponId: coupon.id,
    code: coupon.code,
    discountInr,
    message: `You save ${discountInr} with ${coupon.code}`,
  };
}

export async function incrementCouponUsage(
  tx: Prisma.TransactionClient,
  couponId: string,
) {
  await tx.couponCode.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}

export async function listOperatorCoupons(operatorId: string) {
  return prisma.couponCode.findMany({
    where: { operatorId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOperatorCoupon(
  operatorId: string,
  data: {
    code: string;
    label?: string | null;
    discountType: CouponDiscountType;
    discountValue: number;
    minBookingInr?: number;
    maxUses?: number | null;
    validUntil?: Date | null;
    listingIds?: string[];
  },
) {
  return prisma.couponCode.create({
    data: {
      operatorId,
      code: data.code.trim().toUpperCase(),
      label: data.label ?? null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minBookingInr: data.minBookingInr ?? 0,
      maxUses: data.maxUses ?? null,
      validUntil: data.validUntil ?? null,
      listingIds: data.listingIds ?? [],
    },
  });
}

export async function setCouponActive(
  operatorId: string,
  couponId: string,
  active: boolean,
) {
  return prisma.couponCode.updateMany({
    where: { id: couponId, operatorId },
    data: { active },
  });
}
