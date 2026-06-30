import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { formatInr } from "@/lib/format";
import {
  assertOwnsBookingRef,
  getSessionTraveler,
  isClerkEnabled,
} from "@/lib/auth";
import { getBookingByRef } from "@/lib/bookings-read";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
}: {
  params: { ref: string };
}) {
  const session = await getSessionTraveler();
  if (isClerkEnabled() && !session) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/booking/${params.ref}`)}`,
    );
  }

  if (!session) {
    redirect("/sign-in");
  }

  try {
    await assertOwnsBookingRef(session.userId, params.ref);
  } catch {
    redirect("/bookings");
  }

  const booking = await getBookingByRef(params.ref);
  if (!booking) notFound();

  const startDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(booking.startTimeSnapshot));

  const tone =
    booking.status === "CONFIRMED" || booking.status === "COMPLETED"
      ? "ok"
      : booking.status === "PENDING"
        ? "warn"
        : "info";

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Booking</p>
        <h1 className="sec-title">Your booking details</h1>
        <p className="sec-sub">
          This page reflects the server truth. Payment is only final once the
          webhook captures it.
        </p>

        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-mist">Reference</p>
              <p className="font-display text-2xl font-extrabold">
                {booking.bookingRef}
              </p>
            </div>
            <Badge tone={tone}>{booking.status}</Badge>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-paper-2 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  Experience
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {booking.listingTitleSnapshot}
                </p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  Start time
                </p>
                <p className="mt-1 font-semibold text-ink">{startDate}</p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  Group size
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {booking.groupSize} travelers
                </p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  Total paid
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatInr(booking.totalAmount)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-ink">
                Payment status
              </p>
              <p className="text-sm text-body-muted">
                {booking.payment
                  ? `${booking.payment.status} · order ${booking.payment.razorpayOrderId}`
                  : "Payment record not created yet."}
              </p>
              {booking.status === "PENDING" ? (
                <p className="mt-3 text-sm text-mist">
                  If you just paid, this page may stay pending for a moment until
                  the Razorpay webhook confirms the capture.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
