import "server-only";

import crypto from "crypto";
import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  razorpayClient ??= new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayClient;
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return expected === input.signature;
}

export async function fetchCapturedPaymentForOrder(orderId: string) {
  const client = getRazorpayClient();
  if (!client) return null;

  const payments = await client.orders.fetchPayments(orderId);
  const items = (payments as { items?: { id: string; status: string }[] }).items ?? [];
  const captured = items.find((item) => item.status === "captured");
  if (!captured) return null;

  return { paymentId: captured.id, orderId };
}
