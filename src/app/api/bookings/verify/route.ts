import { confirmCapturedPayment } from "@/lib/booking";
import { requireSessionTraveler, UnauthorizedError } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { verifyCheckoutSignature } from "@/lib/razorpay";

type VerifyBody = {
  bookingRef?: unknown;
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
};

export async function POST(request: Request) {
  let session;
  try {
    session = await requireSessionTraveler();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const mapped = toApiErrorResponse(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = (await request.json()) as VerifyBody;

    if (
      typeof body.bookingRef !== "string" ||
      typeof body.razorpay_order_id !== "string" ||
      typeof body.razorpay_payment_id !== "string" ||
      typeof body.razorpay_signature !== "string"
    ) {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingRef: body.bookingRef },
      include: { payment: true },
    });

    if (!booking || booking.userId !== session.userId) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    if (
      !booking.payment ||
      booking.payment.razorpayOrderId !== body.razorpay_order_id
    ) {
      return Response.json({ error: "ORDER_MISMATCH" }, { status: 400 });
    }

    const valid = verifyCheckoutSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!valid) {
      return Response.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
    }

    const result = await confirmCapturedPayment({
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
    });

    return Response.json(result);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "VERIFY_FAILED" }, { status: 500 })
    );
  }
}
