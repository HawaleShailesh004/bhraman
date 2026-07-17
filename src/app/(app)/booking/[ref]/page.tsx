import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
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
import { BookingDisputeForm } from "@/components/bookings/dispute-form";

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
  const statusLabel =
    display.status.charAt(0) + display.status.slice(1).toLowerCase();
  const escrowCopy =
    display.payment?.escrowStatus === "HELD"
      ? "Your payment is protected and held by Bhraman until the trip is completed."
      : display.payment?.escrowStatus === "DISPUTED"
        ? "The payment is frozen while the Bhraman team reviews the reported issue."
        : display.payment?.escrowStatus === "RELEASED"
          ? "The trip payment has been released after completion."
          : display.payment?.escrowStatus === "REFUNDED"
            ? "The payment has been marked as refunded."
            : null;

  return (
    <main className="min-h-screen bg-paper px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-3xl">
        <div className="reveal-up mb-5 rounded-lg bg-ink p-5 text-paper shadow-[var(--shadow-lg)] sm:mb-7 sm:rounded-[22px] sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber text-amber-text sm:h-11 sm:w-11">
              <CheckCircle2 size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber sm:text-xs">
                Booking {statusLabel.toLowerCase()}
              </p>
              <h1 className="mt-2 font-display text-[clamp(1.5rem,5vw,2.25rem)] text-paper">
                Your adventure is on the calendar.
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-mast-sub">
                Keep reference{" "}
                <strong className="break-all text-paper">
                  {display.bookingRef}
                </strong>{" "}
                handy for trip-day support.
              </p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-mist">Reference</p>
              <p className="font-display text-2xl font-extrabold" aria-label={`Booking reference ${display.bookingRef}`}>
                {display.bookingRef}
              </p>
            </div>
            <Badge tone={tone}>{statusLabel}</Badge>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-paper-2 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  <ReceiptText size={13} />
                  Experience
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {display.listingTitleSnapshot}
                </p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  <CalendarDays size={13} />
                  Start time
                </p>
                <p className="mt-1 font-semibold text-ink">{startDate}</p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  <Users size={13} />
                  Group size
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {display.groupSize} travelers
                </p>
              </div>
              <div className="rounded-md bg-paper-2 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-mist">
                  <ReceiptText size={13} />
                  Total paid
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatInr(display.totalAmount)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-forest/20 bg-[#EAF1EC] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Payment protection
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-body-muted">
                    {escrowCopy ??
                      (display.payment
                        ? "Your payment record is being updated."
                        : "Payment record not created yet.")}
                  </p>
                  {display.payment ? (
                    <p className="mt-2 text-xs text-mist">
                      Payment {display.payment.status.toLowerCase()}
                      {display.payment.disputeStatus
                        ? ` · Review ${display.payment.disputeStatus.toLowerCase()}`
                        : ""}
                    </p>
                  ) : null}
                </div>
              </div>
              {display.status === "PENDING" ? (
                <p className="mt-3 text-sm text-mist">
                  If you completed payment, refresh this page — we sync status
                  directly with Razorpay.
                </p>
              ) : null}
              {display.payment?.escrowStatus === "HELD" &&
              !display.payment.disputeStatus ? (
                <BookingDisputeForm bookingId={display.id} />
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/bookings"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:underline"
              >
                View all bookings <ArrowRight size={15} />
              </Link>
              <Link
                href="/discover"
                className="text-sm font-semibold text-mist transition-colors hover:text-ink"
              >
                Explore another adventure
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
