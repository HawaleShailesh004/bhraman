import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new Response("invalid signature", { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return new Response("invalid signature", { status: 400 });
  }

  const event = JSON.parse(body) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id: string;
          order_id: string;
        };
      };
    };
  };

  if (event.event === "payment.captured") {
    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity) {
      return new Response("ok", { status: 200 });
    }

    const existing = await prisma.payment.findUnique({
      where: { razorpayOrderId: paymentEntity.order_id },
    });

    if (!existing || existing.status === "CAPTURED") {
      return new Response("ok", { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { razorpayOrderId: paymentEntity.order_id },
        data: {
          status: "CAPTURED",
          razorpayPaymentId: paymentEntity.id,
        },
      });

      await tx.booking.update({
        where: { id: existing.bookingId },
        data: { status: "CONFIRMED" },
      });
    });

    await sendBookingConfirmation(existing.bookingId);
  }

  return new Response("ok", { status: 200 });
}
