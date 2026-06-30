import crypto from "crypto";
import { confirmCapturedPayment } from "@/lib/booking";

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

    await confirmCapturedPayment({
      razorpayOrderId: paymentEntity.order_id,
      razorpayPaymentId: paymentEntity.id,
    });
  }

  return new Response("ok", { status: 200 });
}
