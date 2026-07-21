import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  assertOwnsBookingRef,
  getSessionTraveler,
  isClerkEnabled,
} from "@/lib/auth";
import { getBookingByRef } from "@/lib/bookings-read";
import { syncPendingPayment } from "@/lib/booking";
import { getTripHubByRef } from "@/lib/trip-hub";
import { TripHubClient } from "@/components/bookings/trip-hub-client";

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
  const trip = await getTripHubByRef(params.ref, session.userId);

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
              <p className="text-[11px] font-bold uppercase tracking-eyebrow text-amber sm:text-xs">
                Booking {statusLabel.toLowerCase()}
                {trip?.hasUnreadUpdates ? " · new updates" : ""}
              </p>
              <h1 className="mt-2 font-display text-[clamp(1.5rem,5vw,2.25rem)] font-medium tracking-tight text-paper">
                Your trip hub
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-mast-sub">
                Logistics, batch mix, and operator updates live here - reference{" "}
                <strong className="break-all text-paper">
                  {display.bookingRef}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>

        <TripHubClient
          booking={display}
          trip={trip}
          escrowCopy={escrowCopy}
          statusLabel={statusLabel}
          tone={tone}
          startDate={startDate}
        />

        <div className="mt-6 flex justify-end">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:underline"
          >
            Explore another adventure <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}
