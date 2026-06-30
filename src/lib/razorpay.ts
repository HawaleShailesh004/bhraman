import "server-only";

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
