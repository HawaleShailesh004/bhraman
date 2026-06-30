import { AvailabilityForm } from "@/components/operator/AvailabilityForm";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { getOperatorListingOptions } from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperatorAvailabilityPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const listings = await getOperatorListingOptions(session.operatorId);

  return (
    <>
      <OperatorPageHeader
        title="Availability generator"
        subtitle="Repeat weekly slots until a date - the same logic used in seeding and booking."
      />
      <AvailabilityForm listings={listings} />
    </>
  );
}
