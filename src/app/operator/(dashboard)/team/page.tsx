import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { TeamFleetClient } from "@/components/operator/team-fleet-client";
import { getSessionOperator } from "@/lib/auth";
import { getOperatorGuides, getOperatorVehicles } from "@/lib/batches";

export const dynamic = "force-dynamic";

export default async function OperatorTeamPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const [guides, vehicles] = await Promise.all([
    getOperatorGuides(session.operatorId),
    getOperatorVehicles(session.operatorId),
  ]);

  return (
    <>
      <OperatorPageHeader
        title="Team & fleet"
        subtitle="Guides and vehicles you assign to batches. Travelers see the lead and vehicle on their trip page."
      />
      <TeamFleetClient initialGuides={guides} initialVehicles={vehicles} />
    </>
  );
}
