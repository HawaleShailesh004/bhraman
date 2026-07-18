import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Star,
  UsersRound,
} from "lucide-react";
import type { ListingCardData } from "@/types/listing";
import type { OperatorDirectoryCardData } from "@/types/listing";
import { COPY } from "@/lib/marketing-copy";

export function ProofStrip({
  listings,
  operators,
}: {
  listings: ListingCardData[];
  operators: OperatorDirectoryCardData[];
}) {
  const rated = listings.filter((l) => l.ratingCount > 0);
  const avg =
    rated.length > 0
      ? rated.reduce((sum, l) => sum + l.ratingAvg, 0) / rated.length
      : 4.8;
  const verified = operators.filter(
    (o) => o.verificationStatus === "VERIFIED",
  ).length;
  const womanLed = operators.filter(
    (o) => o.totalGuideCount > 0 && o.femaleGuideCount > 0,
  ).length;

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mb-5 max-w-xl">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
          {COPY.proof.eyebrow}
        </p>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {COPY.proof.title}
        </h2>
      </div>
      <div className="overflow-hidden rounded-[22px] border border-line/80 bg-white shadow-[var(--shadow-md)]">
        <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-start gap-3 p-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
              <BadgeCheck size={18} />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-ink">
                {verified || operators.length}+
              </p>
              <p className="text-xs text-body">Verified operators</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFF4E8] text-amber-deep">
              <LockKeyhole size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{COPY.escrow.short}</p>
              <p className="mt-1 text-xs text-body">Not a stranger&apos;s UPI</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
              <UsersRound size={18} />
            </span>
            <div>
              <p className="flex items-center gap-1 font-display text-xl font-bold text-ink">
                {avg.toFixed(1)}
                <Star size={14} className="fill-amber text-amber" aria-hidden />
              </p>
              <p className="text-xs text-body">
                Traveler rating · {womanLed} with women guides
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OperatorSpotlight({
  operators,
}: {
  operators: OperatorDirectoryCardData[];
}) {
  const featured = operators
    .filter((o) => o.verificationStatus === "VERIFIED")
    .slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="page-shell section-y pt-8 sm:pt-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
            Who leads the trip
          </p>
          <h2 className="font-display text-[clamp(1.45rem,3.2vw,2rem)] font-bold tracking-tight text-ink">
            Operators you can look up.
          </h2>
        </div>
        <Link
          href="/operators"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-deep hover:gap-2"
        >
          All operators <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {featured.map((op) => (
          <Link
            key={op.slug}
            href={`/operators/${op.slug}`}
            className="group rounded-[18px] border border-line bg-white p-5 transition-shadow hover:shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest font-display font-extrabold text-paper">
                {op.businessName
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold text-ink group-hover:text-forest">
                  {op.businessName}
                </p>
                <p className="text-xs text-mist">{op.baseCity}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-body">{op.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
              {op.yearsOperating !== null ? (
                <span className="rounded-full bg-paper-2 px-2.5 py-1">
                  {op.yearsOperating}+ years
                </span>
              ) : null}
              {op.totalGuideCount > 0 ? (
                <span className="rounded-full bg-[#EAF1EC] px-2.5 py-1 text-forest">
                  {op.femaleGuideCount}/{op.totalGuideCount} women guides
                </span>
              ) : null}
              <span className="rounded-full bg-paper-2 px-2.5 py-1 text-mist">
                {op.activeListingCount} trips
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function EscrowReserveNote() {
  return (
    <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-mist">
      <LockKeyhole size={12} /> {COPY.escrow.nearReserve}
    </p>
  );
}
