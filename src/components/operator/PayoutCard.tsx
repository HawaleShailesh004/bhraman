"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TopoPattern } from "@/components/ui/TopoPattern";
import { useToast } from "@/components/ui/ToastProvider";
import { formatInr } from "@/lib/format";
import type { OperatorPayoutRow } from "@/types/operator";

function payoutTone(status: OperatorPayoutRow["status"]) {
  if (status === "PAID") return "ok";
  if (status === "PROCESSING") return "warn";
  return "info";
}

export function PayoutCard({ payout }: { payout: OperatorPayoutRow }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pending, setPending] = useState(false);

  async function advanceStatus() {
    setPending(true);
    try {
      const response = await fetch(`/api/operator/payouts/${payout.id}`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Could not advance payout.");
      }
      pushToast({
        title: "Payout updated",
        description: "Settlement status advanced successfully.",
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const nextLabel =
    payout.status === "PENDING"
      ? "Start processing"
      : payout.status === "PROCESSING"
        ? "Mark paid"
        : null;

  return (
    <div className="relative max-w-sm overflow-hidden rounded-lg bg-gradient-to-br from-ink to-[#13231A] p-6 text-paper shadow-lg">
      <TopoPattern className="absolute inset-0 opacity-10" />
      <div className="relative z-[1]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9DB0A4]">
            Pending payout
          </p>
          <Badge tone={payoutTone(payout.status)}>{payout.status}</Badge>
        </div>
        <p className="mt-2 font-display text-[38px] font-black tracking-tight">
          {formatInr(payout.netAmount)}
        </p>
        <p className="text-sm text-[#C9D2CB]">
          Period {new Date(payout.periodStart).toLocaleDateString("en-IN")} –{" "}
          {new Date(payout.periodEnd).toLocaleDateString("en-IN")}
        </p>
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Gross earned</span>
            <b className="text-amber">{formatInr(payout.amount)}</b>
          </div>
          <div className="flex justify-between">
            <span>Platform commission (12%)</span>
            <b>−{formatInr(payout.commission)}</b>
          </div>
          {payout.referenceId ? (
            <div className="flex justify-between">
              <span>Reference</span>
              <b>{payout.referenceId}</b>
            </div>
          ) : null}
        </div>
        {nextLabel ? (
          <Button
            className="mt-5 w-full"
            variant="primary"
            disabled={pending}
            onClick={advanceStatus}
          >
            {pending ? "Updating..." : nextLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
