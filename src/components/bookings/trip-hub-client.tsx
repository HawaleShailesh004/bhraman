"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bus,
  CalendarDays,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { BookingDisputeForm } from "@/components/bookings/dispute-form";
import { formatInr } from "@/lib/format";
import type { BookingSummary } from "@/types/booking";
import type { TripHubData } from "@/types/trip";
import { formatGenderMix } from "@/lib/gender-mix";

export function TripHubClient({
  booking,
  trip,
  escrowCopy,
  statusLabel,
  tone,
  startDate,
}: {
  booking: BookingSummary;
  trip: TripHubData | null;
  escrowCopy: string | null;
  statusLabel: string;
  tone: "ok" | "warn" | "info";
  startDate: string;
}) {
  const [liveTrip, setLiveTrip] = useState(trip);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  useEffect(() => {
    setLiveTrip(trip);
  }, [trip]);

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch(`/api/bookings/${booking.bookingRef}/trip`, {
        cache: "no-store",
      });
      if (response.ok) {
        setLiveTrip((await response.json()) as TripHubData);
      }
    };
    const id = window.setInterval(() => void refresh(), 45_000);
    return () => window.clearInterval(id);
  }, [booking.bookingRef]);

  useEffect(() => {
    if (liveTrip?.hasUnreadUpdates) {
      void fetch(`/api/bookings/${booking.bookingRef}/trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });
    }
  }, [liveTrip?.hasUnreadUpdates, booking.bookingRef]);

  async function cancelBooking() {
    setCancelBusy(true);
    setCancelMsg(null);
    try {
      const estimate = await fetch(`/api/bookings/${booking.bookingRef}/cancel`);
      const estimateData = (await estimate.json()) as { refundEstimate?: number };
      if (!window.confirm(
        `Cancel this booking? Estimated refund: ₹${estimateData.refundEstimate ?? 0}.`,
      )) {
        return;
      }
      const response = await fetch(`/api/bookings/${booking.bookingRef}/cancel`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        ok?: boolean;
        refundAmount?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Cancel failed");
      setCancelMsg(
        data.refundAmount
          ? `Cancelled. Refund of ₹${data.refundAmount} initiated.`
          : "Booking cancelled.",
      );
    } catch (error) {
      setCancelMsg(error instanceof Error ? error.message : "Could not cancel");
    } finally {
      setCancelBusy(false);
    }
  }

  const hub = liveTrip ?? trip;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Booking {booking.bookingRef}
          </h2>
          <Badge tone={tone}>{statusLabel}</Badge>
          {hub?.slotStatus === "LIVE" ? (
            <Badge tone="warn">LIVE</Badge>
          ) : null}
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-ink">
              {booking.listingTitleSnapshot}
            </p>
            <p className="mt-1 text-sm text-mist">
              {hub?.placeName ?? booking.placeName}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Meta
              icon={<CalendarDays size={16} />}
              label="Departure"
              value={startDate}
            />
            <Meta
              icon={<Users size={16} />}
              label="Your group"
              value={`${booking.groupSize} traveler${booking.groupSize === 1 ? "" : "s"}`}
            />
            {hub?.meetingPoint ? (
              <Meta
                icon={<MapPin size={16} />}
                label="Meeting point"
                value={hub.meetingPoint}
              />
            ) : null}
            <Meta
              icon={<ShieldCheck size={16} />}
              label="Paid"
              value={formatInr(booking.totalAmount)}
            />
          </div>
          {hub?.pickupNote ? (
            <p className="rounded-[12px] bg-paper-2 px-3 py-2 text-sm text-body">
              <span className="font-bold">Pickup: </span>
              {hub.pickupNote}
            </p>
          ) : null}
          {hub?.weatherNote ? (
            <p className="rounded-[12px] bg-paper-2 px-3 py-2 text-sm text-body">
              <span className="font-bold">Weather: </span>
              {hub.weatherNote}
            </p>
          ) : null}
          {escrowCopy ? (
            <p className="text-sm leading-relaxed text-body">{escrowCopy}</p>
          ) : null}
        </CardBody>
      </Card>

      {hub ? (
        <>
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-medium tracking-tight">
                Who&apos;s in charge
              </h2>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <UserRound className="mt-0.5 text-forest" size={18} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-mist">
                    Trip lead
                  </p>
                  {hub.guide ? (
                    <>
                      <p className="mt-1 font-medium text-ink">
                        {hub.guide.name}
                      </p>
                      <p className="text-sm text-mist">{hub.guide.role}</p>
                      {hub.guide.phone ? (
                        <p className="mt-1 text-sm text-forest">
                          {hub.guide.phone}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-mist">
                      Lead will be assigned before departure.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Bus className="mt-0.5 text-forest" size={18} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-mist">
                    Vehicle
                  </p>
                  {hub.vehicle ? (
                    <>
                      <p className="mt-1 font-medium text-ink">
                        {hub.vehicle.type}
                      </p>
                      <p className="text-sm text-mist">{hub.vehicle.plate}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-mist">
                      Vehicle details when assigned.
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-medium tracking-tight">
                This batch
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-body">
                {hub.bookedSeats}/{hub.capacity} seats ·{" "}
                {formatGenderMix({
                  female: hub.femaleCount,
                  male: hub.maleCount,
                  other: hub.otherCount,
                  booked: hub.bookedSeats,
                }).label}
                {hub.minSeatsToConfirm
                  ? ` · confirm at ${hub.minSeatsToConfirm}`
                  : ""}
              </p>
              {hub.coTravelers && hub.coTravelers.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {hub.coTravelers.map((c, i) => (
                    <li
                      key={`${c.firstName}-${i}`}
                      className="rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink"
                    >
                      {c.firstName}
                      {c.gender ? ` · ${c.gender.charAt(0)}` : ""}
                      {c.ageBand
                        ? ` · ${c.ageBand.replace("AGE_", "").replaceAll("_", "-")}`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-mist">
                  Co-traveler names appear after your booking is confirmed.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-medium tracking-tight">
                Updates
              </h2>
            </CardHeader>
            <CardBody>
              {hub.updates.length === 0 ? (
                <p className="text-sm text-mist">
                  No updates yet. Check back here for timing, pickup, and weather
                  notes from your operator.
                </p>
              ) : (
                <ul className="space-y-3">
                  {hub.updates.map((u) => (
                    <li
                      key={u.id}
                      className="rounded-[12px] border border-line px-4 py-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-deep">
                        {u.type}
                        {u.pinned ? " · pinned" : ""}
                      </p>
                      <p className="mt-1 font-medium text-ink">{u.title}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-body">
                        {u.body}
                      </p>
                      <p className="mt-2 text-xs text-mist">
                        {new Date(u.createdAt).toLocaleString("en-IN")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {(hub.thingsToCarry.length > 0 || hub.inclusions.length > 0) && (
            <Card>
              <CardHeader>
                <h2 className="font-display text-lg font-medium tracking-tight">
                  Trip prep
                </h2>
              </CardHeader>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                {hub.inclusions.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-mist">
                      Included
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-body">
                      {hub.inclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {hub.thingsToCarry.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-mist">
                      Carry
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-body">
                      {hub.thingsToCarry.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          )}
        </>
      ) : null}

      {booking.payment?.escrowStatus === "HELD" &&
      !booking.payment.disputeStatus ? (
        <BookingDisputeForm bookingId={booking.id} />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/bookings"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold"
        >
          All bookings
        </Link>
        <Link
          href="/bookings/updates"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold"
        >
          Updates feed
        </Link>
        {(booking.status === "CONFIRMED" || booking.status === "PENDING") ? (
          <button
            type="button"
            disabled={cancelBusy}
            onClick={() => void cancelBooking()}
            className="rounded-full border border-clay/40 px-5 py-2.5 text-sm font-bold text-clay disabled:opacity-60"
          >
            Cancel booking
          </button>
        ) : null}
        <Link
          href={`/listings/${booking.listingSlug}`}
          className="rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
        >
          View listing
        </Link>
      </div>
      {cancelMsg ? (
        <p className="text-sm text-body">{cancelMsg}</p>
      ) : null}
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5 rounded-[12px] border border-line px-3 py-2.5">
      <span className="mt-0.5 text-forest">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-ink">{value}</p>
      </div>
    </div>
  );
}
