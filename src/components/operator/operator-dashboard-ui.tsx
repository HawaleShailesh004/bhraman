"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import type { OperatorBookingRow } from "@/types/operator";

const STATUS_TONE: Record<string, string> = {
  CONFIRMED: "bg-[#EAF1EC] text-forest",
  PENDING: "bg-[#FBEEDD] text-amber-deep",
  COMPLETED: "bg-[#E6EDF2] text-[#3A6EA5]",
  CANCELLED: "bg-paper-2 text-mist",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: OperatorBookingRow["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function OperatorBookingsTableUi({
  bookings,
  showActions = true,
  title,
  actionHref,
}: {
  bookings: OperatorBookingRow[];
  showActions?: boolean;
  title?: string;
  actionHref?: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function markCompleted(bookingId: string) {
    setPendingId(bookingId);
    try {
      const response = await fetch(`/api/operator/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!response.ok) throw new Error("Could not mark booking completed.");
      pushToast({
        title: "Booking completed",
        description: "The traveler trip is now marked complete.",
      });
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Could not update booking.",
      });
    } finally {
      setPendingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-line bg-white p-12 text-center">
        <h4 className="font-display text-lg">No bookings yet</h4>
        <p className="mt-2 text-sm text-mist">
          Confirmed traveler bookings for your listings will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-white shadow-[var(--shadow-sm)]">
      {title ? (
        <div className="flex items-center justify-between border-b border-line p-4">
          <h3 className="font-display text-base">{title}</h3>
          {actionHref ? (
            <Link
              href={actionHref}
              className="text-sm font-bold text-amber-deep"
            >
              View all →
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {["Traveler", "Experience", "Date", "Group", "Status", "Amount"]
                .concat(showActions ? ["Action"] : [])
                .map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-mist"
                  >
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-line transition-colors last:border-0 hover:bg-paper"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg,#4C8055,#2D5A3D)",
                      }}
                    >
                      {booking.travelerInitials}
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold">
                      {booking.travelerName}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                  {booking.listingTitle}
                </td>
                <td className="px-4 py-3.5 text-sm">
                  {formatDate(booking.startTime)}
                </td>
                <td className="px-4 py-3.5 text-sm">{booking.groupSize}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[booking.status] ?? STATUS_TONE.PENDING}`}
                  >
                    {statusLabel(booking.status)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold">
                  {formatInr(booking.totalAmount)}
                </td>
                {showActions ? (
                  <td className="px-4 py-3.5">
                    {booking.status === "CONFIRMED" ? (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => markCompleted(booking.id)}
                        className="text-sm font-bold text-amber-deep disabled:opacity-60"
                      >
                        {pendingId === booking.id
                          ? "Saving…"
                          : "Mark completed"}
                      </button>
                    ) : (
                      <span className="text-xs text-mist">-</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OperatorListingManagerUi({
  listings,
}: {
  listings: import("@/types/operator").OperatorListingRow[];
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleListing(
    listing: import("@/types/operator").OperatorListingRow,
  ) {
    const nextStatus = listing.status === "PUBLISHED" ? "PAUSED" : "PUBLISHED";
    setPendingId(listing.id);
    try {
      const response = await fetch(`/api/operator/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Toggle failed");
      pushToast({
        title:
          nextStatus === "PUBLISHED" ? "Listing published" : "Listing paused",
        description: `${listing.title} is now ${nextStatus.toLowerCase()}.`,
      });
      router.refresh();
    } catch {
      pushToast({
        tone: "err",
        title: "Update failed",
        description: "Could not update listing status.",
      });
    } finally {
      setPendingId(null);
    }
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-line bg-white p-12 text-center">
        <h4 className="font-display text-lg">No listings yet</h4>
        <p className="mt-2 text-sm text-mist">
          Create your first experience below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {listings.map((listing) => {
        const isPublished = listing.status === "PUBLISHED";
        return (
          <div
            key={listing.id}
            className={`flex items-center gap-3.5 rounded-[14px] border border-line bg-white p-3 shadow-[var(--shadow-sm)] ${!isPublished ? "opacity-80 saturate-50" : ""}`}
          >
            <div
              className="h-14 w-14 shrink-0 rounded-lg"
              style={listingImageStyle(
                listing.categorySlug,
                listing.heroImageUrl,
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{listing.title}</div>
              <div className="text-xs text-mist">
                {listing.categoryName} · {formatInr(listing.basePrice)} ·{" "}
                {listing.bookingCount} bookings
              </div>
            </div>
            <span
              className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline ${
                isPublished
                  ? "bg-[#EAF1EC] text-forest"
                  : "bg-paper-2 text-mist"
              }`}
            >
              {isPublished ? "Published" : "Paused"}
            </span>
            <button
              type="button"
              aria-label={`Toggle ${listing.title}`}
              disabled={pendingId === listing.id}
              onClick={() => toggleListing(listing)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isPublished ? "bg-forest" : "bg-line"}`}
            >
              <motion.span
                layout
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                style={{ [isPublished ? "right" : "left"]: 2 }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
