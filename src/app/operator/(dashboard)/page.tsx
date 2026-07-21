import {
  OperatorBookingsTableUi,
  OperatorListingManagerUi,
} from "@/components/operator/operator-dashboard-ui";
import { OperatorStatCard } from "@/components/operator/operator-stat-card";
import { PayoutCard } from "@/components/operator/PayoutCard";
import {
  NewListingButton,
  OperatorPageHeader,
} from "@/components/operator/operator-shell";
import {
  getOperatorDashboard,
  getOperatorListings,
  getOperatorPayouts,
} from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperatorOverviewPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const [dashboard, listings, payouts] = await Promise.all([
    getOperatorDashboard(session.operatorId),
    getOperatorListings(session.operatorId),
    getOperatorPayouts(session.operatorId),
  ]);

  const primaryPayout = payouts[0];

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
          paginate={false}
        />

        {primaryPayout ? <PayoutCard payout={primaryPayout} /> : null}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-display text-base">Your listings</h3>
        <OperatorListingManagerUi listings={listings.slice(0, 4)} />
      </div>
    </>
  );
}
