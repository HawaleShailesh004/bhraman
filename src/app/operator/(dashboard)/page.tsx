import { CreateListingForm } from "@/components/operator/CreateListingForm";
import {
  OperatorBookingsTableUi,
  OperatorListingManagerUi,
} from "@/components/operator/operator-dashboard-ui";
import { OperatorStatCard } from "@/components/operator/operator-stat-card";
import {
  NewListingButton,
  OperatorPageHeader,
} from "@/components/operator/operator-shell";
import { TopoLines } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format";
import {
  getOperatorCategories,
  getOperatorDashboard,
  getOperatorListings,
  getOperatorPayouts,
  getOperatorPlaces,
} from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperatorOverviewPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const [dashboard, listings, payouts, places, categories] = await Promise.all([
    getOperatorDashboard(session.operatorId),
    getOperatorListings(session.operatorId),
    getOperatorPayouts(session.operatorId),
    getOperatorPlaces(),
    getOperatorCategories(),
  ]);

  const primaryPayout = payouts[0];
  const monthEarned = payouts.reduce((sum, p) => sum + p.amount, 0);
  const monthCommission = payouts.reduce((sum, p) => sum + p.commission, 0);

  return (
    <>
      <OperatorPageHeader
        title={`Welcome back, ${dashboard.businessName}`}
        subtitle="Here's how this week is shaping up"
        action={<NewListingButton />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {dashboard.stats.map((stat, i) => (
          <OperatorStatCard key={stat.label} {...stat} i={i} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <OperatorBookingsTableUi
          bookings={dashboard.upcomingBookings}
          showActions={false}
          title="Upcoming bookings"
          actionHref="/operator/bookings"
        />

        {primaryPayout ? (
          <div
            className="relative h-fit overflow-hidden rounded-[22px] p-6 text-paper"
            style={{ background: "linear-gradient(135deg,#1A2E22,#13231A)" }}
          >
            <TopoLines opacity={0.12} />
            <div className="relative z-10">
              <div className="text-[12px] font-bold uppercase tracking-wide text-[#9DB0A4]">
                Pending payout
              </div>
              <div className="my-1.5 font-display text-[38px] font-black tracking-tight">
                {formatInr(primaryPayout.netAmount)}
              </div>
              <div className="text-[13px] text-[#C9D2CB]">
                Period{" "}
                {new Date(primaryPayout.periodStart).toLocaleDateString("en-IN")} –{" "}
                {new Date(primaryPayout.periodEnd).toLocaleDateString("en-IN")}
              </div>
              <div className="mt-4 flex justify-between border-t border-white/12 pt-4 text-[13px]">
                <span className="text-[#9DB0A4]">This month earned</span>
                <span className="font-bold text-amber">{formatInr(monthEarned)}</span>
              </div>
              <div className="mt-2 flex justify-between text-[13px]">
                <span className="text-[#9DB0A4]">Commission (12%)</span>
                <span className="font-bold text-amber">−{formatInr(monthCommission)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-display text-base">Your listings</h3>
        <OperatorListingManagerUi listings={listings.slice(0, 4)} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl">Quick create listing</h2>
        <CreateListingForm places={places} categories={categories} />
      </section>
    </>
  );
}
