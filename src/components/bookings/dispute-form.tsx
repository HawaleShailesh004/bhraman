"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, LockKeyhole, X } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/ToastProvider";
import { brandEase, softSpring } from "@/lib/motion";

export function BookingDisputeForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not open dispute");
      pushToast({
        title: "Dispute opened",
        description: "Escrow is frozen while the Bhraman team reviews it.",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Could not open dispute",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!open ? (
        <motion.button
          key="open"
          type="button"
          aria-expanded={false}
          onClick={() => setOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={reduce ? undefined : { x: 2 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          transition={softSpring}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-sm font-bold text-clay transition-colors hover:text-[#9E3E2A]"
        >
          <AlertTriangle size={15} /> Report a booking issue
        </motion.button>
      ) : (
        <motion.div
          key="form"
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -8 }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, height: "auto", y: 0 }
          }
          exit={
            reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -8 }
          }
          transition={
            reduce ? { duration: 0 } : { duration: 0.28, ease: brandEase }
          }
          className="mt-4 overflow-hidden rounded-[14px] border border-clay/25 bg-[#FFF7F5]"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-display text-base">
                  <LockKeyhole size={17} className="text-clay" />
                  Ask Bhraman to review
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-mist">
                  Submitting freezes the operator payout while our team reviews
                  the booking. It does not issue an automatic refund.
                </p>
              </div>
              <motion.button
                type="button"
                aria-label="Close issue form"
                onClick={() => setOpen(false)}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-mist transition-colors hover:bg-white hover:text-ink"
              >
                <X size={16} />
              </motion.button>
            </div>
            <label className="mt-4 block text-sm font-bold">
              What happened, and what outcome do you expect?
              <textarea
                rows={4}
                value={reason}
                maxLength={1000}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Include dates, what was promised, and any steps you have already taken…"
                className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-3 py-2.5 font-normal outline-none focus:border-clay"
              />
            </label>
            <div className="mt-1 flex justify-between text-[11px] text-mist">
              <span>Minimum 10 characters</span>
              <motion.span
                key={reason.length}
                initial={reduce ? false : { opacity: 0.4 }}
                animate={{ opacity: 1 }}
              >
                {reason.length}/1000
              </motion.span>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                disabled={saving || reason.trim().length < 10}
                onClick={submit}
              >
                {saving ? "Submitting securely…" : "Freeze escrow and submit"}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Keep booking unchanged
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
