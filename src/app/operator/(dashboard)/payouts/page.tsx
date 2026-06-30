import { PayoutCard } from "@/components/operator/PayoutCard";
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
  const monthEarned = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const monthCommission = payouts.reduce((sum, payout) => sum + payout.commission, 0);

  return (
    <>
      <OperatorPageHeader
        title="Payouts"
        subtitle="Mock Razorpay Route settlement with a clear 12% platform commission split."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {primary ? <PayoutCard payout={primary} /> : null}
        <div className="rounded-[14px] border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-xl">Settlement summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between border-b border-line pb-3">
              <span>This month earned</span>
              <b>{formatInr(monthEarned)}</b>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <span>Platform commission (12%)</span>
              <b className="text-clay">−{formatInr(monthCommission)}</b>
            </div>
            <div className="flex justify-between">
              <span>Net to operator</span>
              <b className="text-forest">{formatInr(monthEarned - monthCommission)}</b>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm"
              >
                <div className="flex justify-between gap-3">
                  <span>
                    {new Date(payout.periodStart).toLocaleDateString("en-IN")} –{" "}
                    {new Date(payout.periodEnd).toLocaleDateString("en-IN")}
                  </span>
                  <b>{payout.status}</b>
                </div>
                <p className="mt-1 text-mist">
                  Net {formatInr(payout.netAmount)}
                  {payout.referenceId ? ` · ${payout.referenceId}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
