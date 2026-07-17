"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, LockKeyhole, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { formatInr } from "@/lib/format";
import { brandEase } from "@/lib/motion";
import { listingImageStyle } from "@/lib/ui-present";
import type { OperatorBookingRow } from "@/types/operator";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";

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
  paginate = true,
}: {
  bookings: OperatorBookingRow[];
  showActions?: boolean;
  title?: string;
  actionHref?: string;
  paginate?: boolean;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const reduce = useReducedMotion();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const pagination = useClientPagination(bookings, 10);
  const visible = paginate ? pagination.pageItems : bookings;

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

  async function openDispute(bookingId: string) {
    if (disputeReason.trim().length < 10) return;
    setPendingId(bookingId);
    try {
      const response = await fetch(
        `/api/operator/bookings/${bookingId}/dispute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: disputeReason }),
        },
      );
      if (!response.ok) throw new Error("Could not open dispute.");
      pushToast({
        title: "Dispute opened",
        description: "Escrow is frozen for platform review.",
      });
      setDisputeBookingId(null);
      setDisputeReason("");
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Dispute failed",
        description:
          error instanceof Error ? error.message : "Could not open dispute.",
      });
    } finally {
      setPendingId(null);
    }
  }

  const disputeBooking = bookings.find(
    (booking) => booking.id === disputeBookingId,
  );

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
    <>
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-[var(--shadow-sm)] sm:rounded-[14px]">
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <h3 className="min-w-0 truncate font-display text-base">{title}</h3>
          {actionHref ? (
            <Link
              href={actionHref}
              className="shrink-0 text-sm font-bold text-amber-deep"
            >
              View all →
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 p-3 md:hidden">
        {visible.map((booking) => (
          <article
            key={booking.id}
            className="rounded-md border border-line bg-paper p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#4C8055,#2D5A3D)",
                }}
              >
                {booking.travelerInitials}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/operator/bookings/${booking.id}`}
                  className="font-semibold hover:text-forest"
                >
                  {booking.travelerName}
                </Link>
                <p className="truncate text-xs text-mist">
                  {booking.listingTitle}
                </p>
                <p className="mt-1 text-[11px] text-mist">
                  {booking.bookingRef} · {formatDate(booking.startTime)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[booking.status] ?? STATUS_TONE.PENDING}`}
              >
                {statusLabel(booking.status)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
              <span>
                {booking.groupSize} travelers · {formatInr(booking.totalAmount)}
              </span>
              {showActions ? (
                <div className="flex flex-wrap gap-3">
                  {booking.status === "CONFIRMED" &&
                  new Date(booking.endTime).getTime() <= Date.now() ? (
                    <button
                      type="button"
                      disabled={pendingId === booking.id}
                      onClick={() => markCompleted(booking.id)}
                      className="min-h-11 text-sm font-bold text-amber-deep disabled:opacity-60"
                    >
                      {pendingId === booking.id ? "Saving…" : "Mark completed"}
                    </button>
                  ) : null}
                  {booking.escrowStatus === "HELD" &&
                  !booking.disputeStatus ? (
                    <button
                      type="button"
                      disabled={pendingId === booking.id}
                      onClick={() => {
                        setDisputeBookingId(booking.id);
                        setDisputeReason("");
                      }}
                      className="min-h-11 text-sm font-bold text-clay disabled:opacity-60"
                    >
                      Report issue
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px]">
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
            {visible.map((booking) => (
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
                    <div>
                      <Link
                        href={`/operator/bookings/${booking.id}`}
                        className="whitespace-nowrap text-sm font-semibold hover:text-forest"
                      >
                        {booking.travelerName}
                      </Link>
                      <div className="text-[10px] text-mist">
                        {booking.bookingRef}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3.5 text-sm">
                  {booking.listingTitle}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm">
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
                    <div className="flex flex-col items-start gap-1">
                      {booking.status === "CONFIRMED" &&
                      new Date(booking.endTime).getTime() <= Date.now() ? (
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
                      ) : null}
                      {booking.escrowStatus === "HELD" &&
                      !booking.disputeStatus ? (
                        <button
                          type="button"
                          disabled={pendingId === booking.id}
                          onClick={() => {
                            setDisputeBookingId(booking.id);
                            setDisputeReason("");
                          }}
                          className="text-xs font-bold text-clay disabled:opacity-60"
                        >
                          Report issue
                        </button>
                      ) : null}
                    </div>
                    {!(
                      (booking.status === "CONFIRMED" &&
                        new Date(booking.endTime).getTime() <= Date.now()) ||
                      (booking.escrowStatus === "HELD" &&
                        !booking.disputeStatus)
                    ) ? (
                      <span className="text-xs text-mist">-</span>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {disputeBooking ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setDisputeBookingId(null);
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="operator-dispute-title"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 12, scale: 0.98 }
              }
              transition={
                reduce ? { duration: 0 } : { duration: 0.3, ease: brandEase }
              }
              className="w-full max-w-lg rounded-lg border border-line bg-white p-4 shadow-[var(--shadow-lg)] sm:rounded-[22px] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-clay">
                    <AlertTriangle size={15} /> Escrow review
                  </p>
                  <h2
                    id="operator-dispute-title"
                    className="mt-2 font-display text-xl"
                  >
                    Report an issue with {disputeBooking.bookingRef}
                  </h2>
                  <p className="mt-1 text-sm text-mist">
                    {disputeBooking.travelerName} ·{" "}
                    {disputeBooking.listingTitle}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close dispute form"
                  onClick={() => setDisputeBookingId(null)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mist transition-colors hover:bg-paper hover:text-ink"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mt-4 flex gap-2 rounded-[14px] bg-[#FFF7F5] p-3 text-xs leading-relaxed text-[#7D392A]">
                <LockKeyhole size={16} className="shrink-0" />
                Submitting freezes this payment. Bhraman admin will review the
                details before any payout or refund.
              </div>
              <label className="mt-5 block text-sm font-bold">
                What happened?
                <textarea
                  autoFocus
                  rows={5}
                  maxLength={1000}
                  value={disputeReason}
                  onChange={(event) => setDisputeReason(event.target.value)}
                  placeholder="Include dates, traveler communication, evidence, and the outcome you are requesting…"
                  className="inp mt-2 resize-none font-normal"
                />
              </label>
              <div className="mt-1 flex justify-between text-[11px] text-mist">
                <span>Minimum 10 characters</span>
                <span>{disputeReason.length}/1000</span>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    pendingId === disputeBooking.id ||
                    disputeReason.trim().length < 10
                  }
                  onClick={() => openDispute(disputeBooking.id)}
                  className="rounded-full bg-clay px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50"
                >
                  {pendingId === disputeBooking.id
                    ? "Submitting securely…"
                    : "Freeze escrow and submit"}
                </button>
                <button
                  type="button"
                  disabled={pendingId === disputeBooking.id}
                  onClick={() => setDisputeBookingId(null)}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    {paginate ? (
      <PaginationControls
        total={pagination.total}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.changePageSize}
      />
    ) : null}
    </>
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
          Create your first experience from the Create listing tab.
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
              className="touch-target relative grid shrink-0 place-items-center"
            >
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${isPublished ? "bg-forest" : "bg-line"}`}
              >
                <motion.span
                  layout
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                  style={{ [isPublished ? "right" : "left"]: 2 }}
                />
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
