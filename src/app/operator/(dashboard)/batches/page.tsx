import Link from "next/link";
import { formatGenderMixCounts } from "@/lib/gender-mix";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { getSessionOperator } from "@/lib/auth";
import { getOperatorBatches } from "@/lib/batches";

export const dynamic = "force-dynamic";

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function OperatorBatchesPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const batches = await getOperatorBatches(session.operatorId);

  return (
    <>
      <OperatorPageHeader
        title="Batches"
        subtitle="Manage each departure - roster, timings, vehicle, lead, and updates."
      />

      {batches.length === 0 ? (
        <div className="rounded-[16px] border border-line bg-white p-8 text-center">
          <p className="text-sm text-mist">
            No batches yet. Generate availability slots, then manage them here.
          </p>
          <Link
            href="/operator/availability"
            className="mt-4 inline-flex rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
          >
            Open availability
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {batches.map((b) => (
              <article
                key={b.id}
                className="rounded-[16px] border border-line bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-mist">
                      {formatWhen(b.startTime)}
                    </p>
                    <h3 className="mt-1 font-display text-base font-semibold text-ink">
                      {b.listingTitle}
                    </h3>
                    {(b.guideName || b.vehicleLabel) && (
                      <p className="mt-1 text-xs text-mist">
                        {[b.guideName, b.vehicleLabel]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                    {b.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-paper-2 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
                      Seats
                    </p>
                    <p className="mt-0.5 tabular-nums font-semibold text-ink">
                      {b.bookedSeats}/{b.capacity}
                    </p>
                  </div>
                  <div className="rounded-lg bg-paper-2 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
                      Mix
                    </p>
                    <p className="mt-0.5 text-mist">
                      {formatGenderMixCounts({
                        female: b.femaleCount,
                        male: b.maleCount,
                        other: b.otherCount,
                        booked: b.bookedSeats,
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/operator/batches/${b.id}`}
                  className="touch-target mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-amber/15 px-4 py-2.5 text-sm font-bold text-amber-deep"
                >
                  Open board
                </Link>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[16px] border border-line bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper-2/60 text-[11px] font-bold uppercase tracking-wide text-mist">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Mix</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatWhen(b.startTime)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">
                        {b.listingTitle}
                      </div>
                      {(b.guideName || b.vehicleLabel) && (
                        <div className="mt-0.5 text-xs text-mist">
                          {[b.guideName, b.vehicleLabel]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {b.bookedSeats}/{b.capacity}
                    </td>
                    <td className="px-4 py-3 text-xs text-mist">
                      {formatGenderMixCounts({
                        female: b.femaleCount,
                        male: b.maleCount,
                        other: b.otherCount,
                        booked: b.bookedSeats,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                        {b.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/operator/batches/${b.id}`}
                        className="text-sm font-bold text-amber-deep hover:underline"
                      >
                        Open board
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
