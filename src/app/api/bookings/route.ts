import { BookingError, createBooking } from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";
import type { BookingCheckoutResponse } from "@/types/booking";
import {
  resolveTraveler,
  UnauthorizedError,
} from "@/app/api/bookings/helpers";

type BookingRequestBody = {
  listingId?: unknown;
  slotId?: unknown;
  groupSize?: unknown;
  traveler?: {
    name?: unknown;
    email?: unknown;
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
    throw error;
  }

  try {
    const booking = await createBooking({
      userId: traveler.id,
      listingId: body.listingId,
      slotId: body.slotId,
      groupSize: body.groupSize,
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

    return Response.json({ error: "BOOKING_FAILED" }, { status: 500 });
  }
}
