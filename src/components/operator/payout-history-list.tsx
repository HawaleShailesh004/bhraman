"use client";

import { formatInr } from "@/lib/format";
import type { OperatorPayoutRow } from "@/types/operator";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";

export function PayoutHistoryList({ payouts }: { payouts: OperatorPayoutRow[] }) {
  const pagination = useClientPagination(payouts, 10);

  return (
    <div className="mt-8 space-y-3">
      <h3 className="font-display text-base">Settlement history</h3>
      {pagination.pageItems.map((payout) => (
        <div
          key={payout.id}
          className="rounded-lg border border-line bg-paper-2 px-3 py-3 text-sm sm:px-4"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
            <span className="min-w-0">
              {new Date(payout.periodStart).toLocaleDateString("en-IN")} –{" "}
              {new Date(payout.periodEnd).toLocaleDateString("en-IN")}
            </span>
            <b className="capitalize shrink-0">
              {payout.status.toLowerCase().replaceAll("_", " ")}
            </b>
          </div>
          <p className="mt-1 break-all text-mist">
            Net {formatInr(payout.netAmount)}
            {payout.referenceId ? ` · ${payout.referenceId}` : ""}
          </p>
        </div>
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
    </div>
  );
}
