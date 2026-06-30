"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Users, ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import type { BookingSummary } from "@/types/booking";

const TONES: Record<string, string> = {
  CONFIRMED: "bg-[#EAF1EC] text-forest",
  COMPLETED: "bg-[#E6EDF2] text-[#3A6EA5]",
  PENDING: "bg-[#FBEEDD] text-amber-deep",
  CANCELLED: "bg-paper-2 text-mist",
};

const TABS = ["Upcoming", "Past", "All"] as const;

function statusLabel(status: BookingSummary["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isUpcoming(booking: BookingSummary) {
  return (
    (booking.status === "CONFIRMED" || booking.status === "PENDING") &&
    new Date(booking.startTimeSnapshot) >= new Date()
  );
}

export function BookingsClientUi({ bookings }: { bookings: BookingSummary[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");

  const rows = useMemo(() => {
    if (tab === "All") return bookings;
    if (tab === "Upcoming") return bookings.filter(isUpcoming);
    return bookings.filter((b) => !isUpcoming(b));
  }, [bookings, tab]);

  return (
    <div className="page-shell pt-28 pb-24">
      <div className="mb-10 max-w-lg">
        <h1 className="mb-2 font-display text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-tight">
          My bookings
        </h1>
        <p className="text-sm leading-relaxed text-mist">Your adventures, all in one place.</p>
      </div>

      <div className="mb-8 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              tab === t
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white hover:border-mist"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-14 text-center">
          <Compass className="mx-auto mb-4 text-mist" size={32} />
          <h3 className="mb-2 font-display text-lg font-bold">No {tab.toLowerCase()} bookings</h3>
          <p className="mb-6 text-sm text-mist">Time to plan your next adventure.</p>
          <Button href="/discover">Browse adventures</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {rows.map((booking) => (
            <Link
              key={booking.id}
              href={`/booking/${booking.bookingRef}`}
              className="group flex gap-4 rounded-[var(--radius-card)] border border-line/80 bg-white p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] sm:gap-5 sm:p-5"
            >
              <div
                className="h-20 w-20 shrink-0 rounded-lg sm:h-24 sm:w-24"
                style={listingImageStyle(booking.categorySlug, booking.heroImageUrl)}
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-bold leading-snug">
                    {booking.listingTitleSnapshot}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TONES[booking.status] ?? TONES.PENDING}`}
                  >
                    {statusLabel(booking.status)}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#54635A]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {booking.placeName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(booking.startTimeSnapshot)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {booking.groupSize} people
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-line/70 pt-3">
                  <span className="font-mono text-[11px] text-mist">
                    {booking.bookingRef} · {formatInr(booking.totalAmount)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-deep transition-all group-hover:gap-1.5">
                    View details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
