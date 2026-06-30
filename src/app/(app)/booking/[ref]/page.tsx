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
import { syncPendingPayment } from "@/lib/booking";

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

  if (
    booking.status === "PENDING" &&
    booking.payment?.status === "CREATED" &&
    booking.payment.razorpayOrderId
  ) {
    await syncPendingPayment(booking.payment.razorpayOrderId);
  }

  const refreshed = await getBookingByRef(params.ref);
  const display = refreshed ?? booking;

  const startDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(display.startTimeSnapshot));

  const tone =
    display.status === "CONFIRMED" || display.status === "COMPLETED"
      ? "ok"
      : display.status === "PENDING"
        ? "warn"
        : "info";

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Booking</p>
        <h1 className="sec-title">Your booking details</h1>
        <p className="sec-sub">
          Payment is confirmed instantly after checkout. Refresh if status is
          still updating.
        </p>

        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-mist">Reference</p>
              <p className="font-display text-2xl font-extrabold">
                {display.bookingRef}
              </p>
            </div>
            <Badge tone={tone}>{display.status}</Badge>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-paper-2 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  Experience
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {display.listingTitleSnapshot}
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
                  {display.groupSize} travelers
                </p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  Total paid
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatInr(display.totalAmount)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-ink">
                Payment status
              </p>
              <p className="text-sm text-body-muted">
                {display.payment
                  ? `${display.payment.status} · order ${display.payment.razorpayOrderId}`
                  : "Payment record not created yet."}
              </p>
              {display.status === "PENDING" ? (
                <p className="mt-3 text-sm text-mist">
                  If you completed payment, refresh this page — we sync status
                  directly with Razorpay.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
