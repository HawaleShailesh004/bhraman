"use client";

import { Badge } from "@/components/ui/Badge";
import { TopoPattern } from "@/components/ui/TopoPattern";
import { formatInr } from "@/lib/format";
import type { OperatorPayoutRow } from "@/types/operator";

function payoutTone(status: OperatorPayoutRow["status"]) {
  if (status === "PAID") return "ok";
  if (status === "PROCESSING") return "warn";
  return "info";
}

export function PayoutCard({ payout }: { payout: OperatorPayoutRow }) {
  return (
    <div className="relative w-full max-w-none overflow-hidden rounded-lg bg-gradient-to-br from-ink to-[#13231A] p-5 text-paper shadow-lg sm:max-w-sm sm:p-6 lg:max-w-none">
      <TopoPattern className="absolute inset-0 opacity-10" />
      <div className="relative z-[1]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9DB0A4]">
            {payout.status === "PAID"
              ? "Latest settlement"
              : payout.status === "PROCESSING"
                ? "Settlement processing"
                : "Payout queued"}
          </p>
          <Badge tone={payoutTone(payout.status)}>{payout.status}</Badge>
        </div>
        <p className="mt-2 font-display text-[clamp(1.75rem,6vw,2.375rem)] font-black tracking-tight">
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
            <div className="flex justify-between gap-3">
              <span className="shrink-0">Reference</span>
              <b className="min-w-0 truncate text-right">{payout.referenceId}</b>
            </div>
          ) : null}
        </div>
        <p className="mt-5 text-xs text-[#9DB0A4]">
          Settlement status updates automatically through Bhraman and the
          payment provider.
        </p>
      </div>
    </div>
  );
}
