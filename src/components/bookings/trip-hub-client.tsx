"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (trip?.hasUnreadUpdates) {
      void fetch(`/api/bookings/${booking.bookingRef}/trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });
    }
  }, [trip?.hasUnreadUpdates, booking.bookingRef]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Booking {booking.bookingRef}
          </h2>
          <Badge tone={tone}>{statusLabel}</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-ink">
              {booking.listingTitleSnapshot}
            </p>
            <p className="mt-1 text-sm text-mist">
              {trip?.placeName ?? booking.placeName}
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
            {trip?.meetingPoint ? (
              <Meta
                icon={<MapPin size={16} />}
                label="Meeting point"
                value={trip.meetingPoint}
              />
            ) : null}
            <Meta
              icon={<ShieldCheck size={16} />}
              label="Paid"
              value={formatInr(booking.totalAmount)}
            />
          </div>
          {trip?.pickupNote ? (
            <p className="rounded-[12px] bg-paper-2 px-3 py-2 text-sm text-body">
              <span className="font-bold">Pickup: </span>
              {trip.pickupNote}
            </p>
          ) : null}
          {trip?.weatherNote ? (
            <p className="rounded-[12px] bg-paper-2 px-3 py-2 text-sm text-body">
              <span className="font-bold">Weather: </span>
              {trip.weatherNote}
            </p>
          ) : null}
          {escrowCopy ? (
            <p className="text-sm leading-relaxed text-body">{escrowCopy}</p>
          ) : null}
        </CardBody>
      </Card>

      {trip ? (
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
                  {trip.guide ? (
                    <>
                      <p className="mt-1 font-medium text-ink">
                        {trip.guide.name}
                      </p>
                      <p className="text-sm text-mist">{trip.guide.role}</p>
                      {trip.guide.phone ? (
                        <p className="mt-1 text-sm text-forest">
                          {trip.guide.phone}
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
                  {trip.vehicle ? (
                    <>
                      <p className="mt-1 font-medium text-ink">
                        {trip.vehicle.type}
                      </p>
                      <p className="text-sm text-mist">{trip.vehicle.plate}</p>
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
                {trip.bookedSeats}/{trip.capacity} seats · {trip.femaleCount}{" "}
                women · {trip.maleCount} men
                {trip.otherCount ? ` · ${trip.otherCount} other` : ""}
                {trip.minSeatsToConfirm
                  ? ` · confirm at ${trip.minSeatsToConfirm}`
                  : ""}
              </p>
              {trip.coTravelers && trip.coTravelers.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {trip.coTravelers.map((c, i) => (
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
              {trip.updates.length === 0 ? (
                <p className="text-sm text-mist">
                  No updates yet. Check back here for timing, pickup, and weather
                  notes from your operator.
                </p>
              ) : (
                <ul className="space-y-3">
                  {trip.updates.map((u) => (
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

          {(trip.thingsToCarry.length > 0 || trip.inclusions.length > 0) && (
            <Card>
              <CardHeader>
                <h2 className="font-display text-lg font-medium tracking-tight">
                  Trip prep
                </h2>
              </CardHeader>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                {trip.inclusions.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-mist">
                      Included
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-body">
                      {trip.inclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {trip.thingsToCarry.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-mist">
                      Carry
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-body">
                      {trip.thingsToCarry.map((item) => (
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
          href={`/listings/${booking.listingSlug}`}
          className="rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
        >
          View listing
        </Link>
      </div>
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
