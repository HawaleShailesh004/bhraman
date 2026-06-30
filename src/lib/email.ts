import "server-only";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendBookingConfirmation(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      payment: true,
    },
  });

  if (!booking) return;

  const resend = getResendClient();
  const subject = `Bhraman booking confirmed · ${booking.bookingRef}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1A2E22;">
      <h2 style="margin-bottom: 8px;">Your booking is confirmed</h2>
      <p>Hi ${booking.user.name},</p>
      <p>Your Bhraman booking is confirmed and payment has been captured.</p>
      <ul>
        <li><strong>Reference:</strong> ${booking.bookingRef}</li>
        <li><strong>Experience:</strong> ${booking.listingTitleSnapshot}</li>
        <li><strong>Group size:</strong> ${booking.groupSize}</li>
        <li><strong>Total paid:</strong> ${formatInr(booking.totalAmount)}</li>
      </ul>
      <p>You can open your confirmation page in the app to review the booking details.</p>
    </div>
  `;

  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    console.log("Booking confirmation email skipped", {
      bookingRef: booking.bookingRef,
      email: booking.user.email,
    });
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: booking.user.email,
    subject,
    html,
  });
}
