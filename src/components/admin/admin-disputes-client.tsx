"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { DisputeResolutionCard } from "@/components/admin/dispute-resolution-card";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";
import type { AdminDisputeRow } from "@/types/admin";

export function AdminDisputesClient({
  disputes,
}: {
  disputes: AdminDisputeRow[];
}) {
  const pagination = useClientPagination(disputes, 10);
  const processingCount = disputes.filter(
    (dispute) => dispute.status === "PROCESSING",
  ).length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="reveal-up rounded-[14px] border border-line bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mist">
            <ShieldAlert size={15} className="text-clay" /> Needs review
          </p>
          <p className="mt-2 font-display text-3xl">{disputes.length}</p>
        </div>
        <div
          className="reveal-up rounded-[14px] border border-line bg-white p-4 shadow-[var(--shadow-sm)]"
          style={{ animationDelay: "70ms" }}
        >
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mist">
            Processing
          </p>
          <p className="mt-2 font-display text-3xl">{processingCount}</p>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {disputes.length > 0 ? (
          <>
            {pagination.pageItems.map((dispute) => (
              <DisputeResolutionCard
                key={dispute.paymentId}
                dispute={dispute}
              />
            ))}
            <PaginationControls
              total={pagination.total}
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.changePageSize}
            />
          </>
        ) : (
          <div className="rounded-[14px] border border-dashed border-line bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto text-forest" size={30} />
            <h2 className="font-display text-lg">No open disputes</h2>
            <p className="mt-1 text-sm text-mist">
              New traveler or operator disputes will appear here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
