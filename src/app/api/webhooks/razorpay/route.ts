import crypto from "crypto";
import { confirmCapturedPayment } from "@/lib/booking";
import { toApiErrorResponse } from "@/lib/api-errors";

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

  try {
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
      const payment = event.payload?.payment?.entity;
      if (payment?.id && payment.order_id) {
        await confirmCapturedPayment({
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
        });
      }
    }

    return new Response("ok");
  } catch (error) {
    const mapped = toApiErrorResponse(error);
    if (mapped) return mapped;
    console.error("[razorpay webhook]", error);
    return new Response("webhook failed", { status: 500 });
  }
}
