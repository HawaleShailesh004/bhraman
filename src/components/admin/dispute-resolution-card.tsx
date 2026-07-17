"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/ToastProvider";
import { formatInr } from "@/lib/format";
import { brandEase } from "@/lib/motion";
import type { AdminDisputeRow } from "@/types/admin";

const RESOLUTIONS = [
  { value: "RELEASE", label: "Release to operator", icon: Send },
  { value: "REFUND", label: "Full refund", icon: RotateCcw },
  { value: "PARTIAL", label: "Split payment", icon: CheckCircle2 },
] as const;

function formatDisputeStatus(status: AdminDisputeRow["status"]) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatOpenedBy(openedBy: AdminDisputeRow["openedBy"]) {
  if (!openedBy) return "Unknown";
  return openedBy.charAt(0) + openedBy.slice(1).toLowerCase();
}

export function DisputeResolutionCard({
  dispute,
}: {
  dispute: AdminDisputeRow;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [resolution, setResolution] = useState<
    "RELEASE" | "REFUND" | "PARTIAL" | null
  >(null);
  const [refundAmount, setRefundAmount] = useState(
    Math.round(dispute.amount / 2),
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const reduce = useReducedMotion();

  async function resolve() {
    if (!resolution) return;
    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/disputes/${dispute.paymentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolution, refundAmount, note }),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Resolution failed");
      }
      pushToast({
        title: "Dispute resolved",
        description:
          resolution === "RELEASE"
            ? "Escrow was released to the operator payout queue."
            : "The refund was initiated and escrow was updated.",
      });
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Resolution failed",
        description:
          error instanceof Error ? error.message : "Could not resolve dispute.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.article
      layout
      className="rounded-md border border-line bg-white p-4 shadow-[var(--shadow-sm)] sm:rounded-[14px] sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-clay" />
            <h2 className="font-display text-lg">{dispute.bookingRef}</h2>
          </div>
          <p className="mt-1 text-sm text-mist">
            {dispute.listingTitle} · {dispute.operatorName}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold">
            {formatInr(dispute.amount)}
          </p>
          <p className="flex items-center gap-1 text-xs text-mist">
            <Clock3 size={12} />
            {new Date(dispute.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-paper-2 p-4 text-sm sm:grid-cols-2">
        <div>
          <span className="text-mist">Traveler</span>
          <p className="font-semibold">{dispute.travelerName}</p>
          <p className="text-xs text-mist">{dispute.travelerEmail}</p>
        </div>
        <div>
          <span className="text-mist">Opened by</span>
          <p className="font-semibold">
            {formatOpenedBy(dispute.openedBy)} ·{" "}
            {formatDisputeStatus(dispute.status)}
          </p>
        </div>
      </div>

      <blockquote className="mt-4 border-l-2 border-clay pl-4 text-sm leading-relaxed text-ink-muted">
        {dispute.reason}
      </blockquote>

      {dispute.status === "PROCESSING" ? (
        <p className="mt-5 rounded-lg bg-[#FBEEDD] p-3 text-sm text-amber-deep">
          A resolution is currently processing. Check Razorpay before retrying.
        </p>
      ) : (
        <div className="mt-5 space-y-4 border-t border-line pt-5">
          <div>
            <p className="text-sm font-bold">Choose one final outcome</p>
            <p className="mt-0.5 text-xs text-mist">
              You will review the exact money movement before confirming.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Dispute resolution outcome"
            className="grid gap-2 md:grid-cols-3"
          >
            {RESOLUTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={resolution === value}
                onClick={() => {
                  setResolution(value);
                  setConfirming(false);
                }}
                className={`rounded-lg border px-3 py-3 text-left text-sm font-semibold transition-all ${
                  resolution === value
                    ? "border-amber bg-[#FFF9F0] text-amber-deep shadow-[0_0_0_3px_rgba(224,138,43,0.1)]"
                    : "border-line bg-white hover:border-mist"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={15} /> {label}
                </span>
              </button>
            ))}
          </div>
          {resolution === "PARTIAL" ? (
            <label className="block text-sm font-bold">
              Refund amount (INR)
              <input
                type="number"
                min={1}
                max={dispute.amount - 1}
                value={refundAmount}
                onChange={(event) =>
                  setRefundAmount(Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 font-normal outline-none focus:border-amber"
              />
            </label>
          ) : null}
          <label className="block text-sm font-bold">
            Internal resolution note
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Evidence reviewed and decision rationale…"
              className="mt-2 w-full resize-none rounded-lg border border-line bg-paper px-4 py-3 font-normal outline-none focus:border-amber"
            />
          </label>
          <p className="-mt-3 text-[11px] text-mist">
            Record the evidence reviewed and why this outcome is fair.
          </p>

          <AnimatePresence mode="wait" initial={false}>
            {!confirming ? (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.2 }}
              >
                <Button
                  disabled={
                    !resolution ||
                    note.trim().length < 10 ||
                    (resolution === "PARTIAL" &&
                      (refundAmount < 1 || refundAmount >= dispute.amount))
                  }
                  onClick={() => setConfirming(true)}
                >
                  Review money movement
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.28, ease: brandEase }
                }
                className="rounded-[14px] border border-clay/25 bg-[#FFF7F5] p-4"
                role="alert"
              >
                <p className="flex items-center gap-2 font-display text-base">
                  <AlertTriangle size={17} className="text-clay" />
                  Final confirmation
                </p>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-mist">Traveler receives</p>
                    <p className="font-display text-lg">
                      {formatInr(
                        resolution === "REFUND"
                          ? dispute.amount
                          : resolution === "PARTIAL"
                            ? refundAmount
                            : 0,
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-mist">Operator payout queue</p>
                    <p className="font-display text-lg">
                      {formatInr(
                        resolution === "RELEASE"
                          ? dispute.amount
                          : resolution === "PARTIAL"
                            ? dispute.amount - refundAmount
                            : 0,
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-clay">
                  This cannot be undone here and may initiate a real Razorpay
                  refund.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="dark"
                    disabled={saving}
                    onClick={resolve}
                  >
                    {saving ? "Processing…" : "Confirm and process"}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={saving}
                    onClick={() => setConfirming(false)}
                  >
                    <ArrowLeft size={15} /> Go back
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.article>
  );
}
