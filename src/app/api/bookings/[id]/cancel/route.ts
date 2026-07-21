import { BookingError, cancelBooking } from "@/lib/booking";
import { computeRefund } from "@/lib/refunds";
import { prisma } from "@/lib/prisma";
import { refundCapturedPayment } from "@/lib/razorpay";
import { getSessionTraveler } from "@/lib/auth";
import type { CancellationPolicy } from "@/lib/refunds";

/**
 * Dynamic segment is named `id` to match other `/api/bookings/[id]/*` routes.
 * Callers pass bookingRef (e.g. BHR-xxxxx) as the path param.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionTraveler();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ref } = await params;
  const booking = await prisma.booking.findFirst({
    where: { bookingRef: ref, userId: session.userId },
    include: {
      listing: { select: { cancellationPolicy: true } },
      payment: true,
    },
  });

  if (!booking) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  const policy = booking.listing.cancellationPolicy as CancellationPolicy;
  const refundEstimate = computeRefund(
    {
      totalAmount: booking.totalAmount,
      startTimeSnapshot: booking.startTimeSnapshot,
    },
    policy,
    "USER",
  );

  try {
    const result = await cancelBooking(booking.id, "USER");

    if (
      booking.payment?.razorpayPaymentId &&
      result.refundAmount > 0
    ) {
      try {
        await refundCapturedPayment({
          paymentId: booking.payment.razorpayPaymentId,
          amount: result.refundAmount,
          receipt: `refund-${booking.bookingRef}`,
        });
      } catch {
        // DB already updated; ops can reconcile refund manually
      }
    }

    return Response.json({
      ok: true,
      refundAmount: result.refundAmount,
      estimate: refundEstimate,
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return Response.json({ error: error.code }, { status: 400 });
    }
    return Response.json({ error: "Cancel failed." }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionTraveler();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ref } = await params;
  const booking = await prisma.booking.findFirst({
    where: { bookingRef: ref, userId: session.userId },
    include: { listing: { select: { cancellationPolicy: true } } },
  });

  if (!booking) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  const policy = booking.listing.cancellationPolicy as CancellationPolicy;
  const refundEstimate = computeRefund(
    {
      totalAmount: booking.totalAmount,
      startTimeSnapshot: booking.startTimeSnapshot,
    },
    policy,
    "USER",
  );

  return Response.json({
    cutoffHours: policy.cutoffHours,
    refundEstimate,
    canCancel:
      booking.status === "CONFIRMED" || booking.status === "PENDING",
  });
}
