import { BookingError, createBooking } from "@/lib/booking";
import { AgeBand, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";
import { toApiErrorResponse } from "@/lib/api-errors";
import type { BookingCheckoutResponse } from "@/types/booking";
import {
  resolveTraveler,
  UnauthorizedError,
} from "@/app/api/bookings/helpers";

function parseParticipants(raw: unknown, groupSize: number) {
  if (!Array.isArray(raw)) return undefined;
  const list = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const p = item as Record<string, unknown>;
      if (typeof p.name !== "string" || !p.name.trim()) return null;
      return {
        name: p.name.trim().slice(0, 120),
        gender:
          typeof p.gender === "string" &&
          Object.values(Gender).includes(p.gender as Gender)
            ? (p.gender as Gender)
            : null,
        ageBand:
          typeof p.ageBand === "string" &&
          Object.values(AgeBand).includes(p.ageBand as AgeBand)
            ? (p.ageBand as AgeBand)
            : null,
        age:
          typeof p.age === "number" && p.age >= 1 && p.age <= 120
            ? p.age
            : null,
      };
    })
    .filter(Boolean) as {
    name: string;
    gender: Gender | null;
    ageBand: AgeBand | null;
    age: number | null;
  }[];
  if (!list.length) return undefined;
  return list.slice(0, groupSize);
}

type BookingRequestBody = {
  listingId?: unknown;
  slotId?: unknown;
  groupSize?: unknown;
  customerGender?: unknown;
  emergencyContactName?: unknown;
  emergencyContactPhone?: unknown;
  medicalNotes?: unknown;
  participants?: unknown;
  couponCode?: unknown;
  traveler?: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
  };
};

export async function POST(request: Request) {
  const body = (await request.json()) as BookingRequestBody;

  if (
    typeof body.listingId !== "string" ||
    typeof body.slotId !== "string" ||
    typeof body.groupSize !== "number"
  ) {
    return Response.json({ error: "Invalid booking payload." }, { status: 400 });
  }
  if (
    typeof body.customerGender !== "string" ||
    !Object.values(Gender).includes(body.customerGender as Gender)
  ) {
    return Response.json({ error: "Invalid customer gender." }, { status: 400 });
  }
  if (
    typeof body.traveler?.phone !== "string" ||
    body.traveler.phone.trim().length < 7 ||
    typeof body.emergencyContactName !== "string" ||
    !body.emergencyContactName.trim() ||
    typeof body.emergencyContactPhone !== "string" ||
    body.emergencyContactPhone.trim().length < 7 ||
    (body.medicalNotes !== undefined &&
      typeof body.medicalNotes !== "string")
  ) {
    return Response.json({ error: "Invalid safety details." }, { status: 400 });
  }

  let traveler;
  try {
    traveler = await resolveTraveler({
      name: typeof body.traveler?.name === "string" ? body.traveler.name : undefined,
      email:
        typeof body.traveler?.email === "string" ? body.traveler.email : undefined,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json(
        { error: "UNAUTHORIZED", message: "Sign in to complete your booking." },
        { status: 401 },
      );
    }
    const mapped = toApiErrorResponse(error);
    if (mapped) return mapped;
    return Response.json({ error: "BOOKING_FAILED" }, { status: 500 });
  }

  try {
    const booking = await createBooking({
      userId: traveler.id,
      listingId: body.listingId,
      slotId: body.slotId,
      groupSize: body.groupSize,
      customerEmail: traveler.email,
      customerPhone:
        typeof body.traveler?.phone === "string"
          ? body.traveler.phone.trim().slice(0, 30) || null
          : null,
      customerGender: (body.customerGender as Gender | undefined) ?? null,
      emergencyContactName:
        typeof body.emergencyContactName === "string"
          ? body.emergencyContactName.trim().slice(0, 120) || null
          : null,
      emergencyContactPhone:
        typeof body.emergencyContactPhone === "string"
          ? body.emergencyContactPhone.trim().slice(0, 30) || null
          : null,
      medicalNotes:
        typeof body.medicalNotes === "string"
          ? body.medicalNotes.trim().slice(0, 2000) || null
          : null,
      participants: parseParticipants(body.participants, body.groupSize),
      couponCode:
        typeof body.couponCode === "string" ? body.couponCode : null,
    });

    const razorpay = getRazorpayClient();
    const keyId = process.env.RAZORPAY_KEY_ID ?? null;
    let razorpayOrderId: string;
    let mode: BookingCheckoutResponse["mode"];

    if (razorpay && keyId) {
      const order = await razorpay.orders.create({
        amount: booking.totalAmount * 100,
        currency: "INR",
        receipt: booking.bookingRef,
        notes: { bookingId: booking.id },
      });
      razorpayOrderId = order.id;
      mode = "razorpay";
    } else {
      razorpayOrderId = `mock_order_${booking.id}`;
      mode = "mock";
    }

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        razorpayOrderId,
        status: "CREATED",
      },
    });

    const payload: BookingCheckoutResponse = {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      razorpayOrderId,
      amount: booking.totalAmount,
      currency: "INR",
      keyId,
      mode,
    };

    return Response.json(payload);
  } catch (error) {
    if (error instanceof BookingError) {
      const status =
        error.code === "SLOT_UNAVAILABLE" || error.code === "INVALID_GROUP_SIZE"
          ? 409
          : 400;
      return Response.json({ error: error.code }, { status });
    }
    if (error instanceof Error && error.message) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "BOOKING_FAILED" }, { status: 500 })
    );
  }
}
