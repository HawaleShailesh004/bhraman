import { Clock3, Wallet } from "lucide-react";
import { PayoutCard } from "@/components/operator/PayoutCard";
import { PayoutHistoryList } from "@/components/operator/payout-history-list";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { formatInr } from "@/lib/format";
import { getOperatorPayouts } from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperatorPayoutsPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const payouts = await getOperatorPayouts(session.operatorId);
  const primary = payouts[0];
  const now = new Date();
  const currentMonth = payouts.filter((payout) => {
    const date = new Date(payout.periodEnd);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
  const monthEarned = currentMonth.reduce(
    (sum, payout) => sum + payout.amount,
    0,
  );
  const monthCommission = currentMonth.reduce(
    (sum, payout) => sum + payout.commission,
    0,
  );

  return (
    <>
      <OperatorPageHeader
        title="Payouts"
        subtitle="Escrow-released settlements with a clear 12% platform commission split."
      />

      {!primary ? (
        <div className="rounded-[14px] border border-dashed border-line bg-white p-10 text-center sm:p-12">
          <Wallet className="mx-auto text-mist" size={30} />
          <h2 className="mt-3 font-display text-xl">No settlements yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist">
            Payouts appear after a completed trip clears its dispute window.
            Bhraman then queues the net amount automatically.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm items-start gap-2 rounded-lg bg-paper-2 p-3 text-left text-xs text-[#54635A]">
            <Clock3 size={15} className="mt-0.5 shrink-0 text-amber-deep" />
            You do not need to manually release or advance a payout.
          </div>
        </div>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <PayoutCard payout={primary} />
        <div className="min-w-0 rounded-md border border-line bg-white p-4 shadow-[var(--shadow-sm)] sm:rounded-[14px] sm:p-6">
          <h2 className="font-display text-xl">Settlement summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-line pb-3">
              <span>This month earned</span>
              <b className="shrink-0">{formatInr(monthEarned)}</b>
            </div>
            <div className="flex justify-between gap-3 border-b border-line pb-3">
              <span>Platform commission (12%)</span>
              <b className="shrink-0 text-clay">−{formatInr(monthCommission)}</b>
            </div>
            <div className="flex justify-between gap-3">
              <span>Net to operator</span>
              <b className="shrink-0 text-forest">
                {formatInr(monthEarned - monthCommission)}
              </b>
            </div>
          </div>

          <PayoutHistoryList payouts={payouts} />
        </div>
      </div>
      )}
    </>
  );
}
