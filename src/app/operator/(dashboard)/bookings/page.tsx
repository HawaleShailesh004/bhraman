import { OperatorBookingsTableUi } from "@/components/operator/operator-dashboard-ui";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { getOperatorBookings } from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperatorBookingsPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const bookings = await getOperatorBookings(session.operatorId);

  return (
    <>
      <OperatorPageHeader
        title="Bookings"
        subtitle="Upcoming and recent traveler bookings for your experiences."
      />
      <OperatorBookingsTableUi bookings={bookings} />
    </>
  );
}
