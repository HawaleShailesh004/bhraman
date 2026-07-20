import { notFound } from "next/navigation";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { BatchBoardClient } from "@/components/operator/batch-board-client";
import { getSessionOperator } from "@/lib/auth";
import {
  getOperatorBatchDetail,
  getOperatorGuides,
  getOperatorVehicles,
} from "@/lib/batches";

export const dynamic = "force-dynamic";

export default async function OperatorBatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionOperator();
  if (!session) return null;

  const [batch, guides, vehicles] = await Promise.all([
    getOperatorBatchDetail(session.operatorId, params.id),
    getOperatorGuides(session.operatorId),
    getOperatorVehicles(session.operatorId),
  ]);

  if (!batch) notFound();

  return (
    <>
      <OperatorPageHeader
        title={batch.listingTitle}
        subtitle={`Batch board · ${new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(batch.startTime))}`}
      />
      <BatchBoardClient
        initial={batch}
        guides={guides.filter((g) => g.active)}
        vehicles={vehicles.filter((v) => v.active)}
      />
    </>
  );
}
