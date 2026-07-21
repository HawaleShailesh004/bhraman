"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, MapPin } from "lucide-react";
import type { CompareListingRow, PlaceCompareBundle } from "@/lib/compare";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import { brandEase } from "@/lib/motion";
import { ExperienceBadge, SafetyBadge } from "@/components/ui/trust-badges";
import { StarRating, DifficultyMeter } from "@/components/ui/primitives";
import { CompareDetailModal } from "@/components/compare/compare-detail-modal";

function formatWhen(iso: string | null) {
  if (!iso) return "No upcoming dates";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function LabelCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[3.25rem] items-center border-b border-line/60 px-1 py-3 text-[10px] font-bold uppercase tracking-wide text-mist sm:px-2 sm:text-[11px] ${className}`}
    >
      {children}
    </div>
  );
}

function ValueCell({
  children,
  highlight = false,
  className = "",
}: {
  children: React.ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[3.25rem] flex-col justify-center border-b border-line/60 px-2 py-3 sm:px-3 sm:py-3.5 ${
        highlight ? "bg-amber/10" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function OperatorHeader({ row }: { row: CompareListingRow }) {
  const imageStyle = listingImageStyle(row.category.slug, row.heroImageUrl);

  return (
    <div className="flex min-h-[9rem] flex-col overflow-hidden rounded-t-[var(--radius-card)] border border-b-0 border-line/80 bg-white sm:min-h-[10rem]">
      <div className="relative h-20 shrink-0 overflow-hidden sm:h-24">
        <div className="absolute inset-0" style={imageStyle} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-2 py-3 sm:px-3">
        <p className="flex items-start gap-1 font-display text-xs font-bold leading-snug text-ink sm:text-sm">
          {row.operator.isVerified ? (
            <BadgeCheck size={13} className="mt-0.5 shrink-0 text-forest" />
          ) : null}
          <span className="line-clamp-2">{row.operator.businessName}</span>
        </p>
        <div className="mt-1.5">
          <StarRating rating={row.ratingAvg} count={row.ratingCount} />
        </div>
      </div>
    </div>
  );
}

function CompareColumn({
  row,
  lowestPrice,
  divider,
  onOpen,
}: {
  row: CompareListingRow;
  lowestPrice: number;
  divider: boolean;
  onOpen: (row: CompareListingRow) => void;
}) {
  const isBestPrice = row.basePrice === lowestPrice;

  return (
    <button
      type="button"
      onClick={() => onOpen(row)}
      className={`group min-w-0 flex-1 cursor-pointer text-left transition-colors hover:bg-paper/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber ${
        divider ? "border-r border-line/50" : ""
      }`}
      aria-label={`View full details for ${row.operator.businessName}`}
    >
      <OperatorHeader row={row} />

      <ValueCell>
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink sm:text-sm">
          {row.title}
        </p>
        <p className="mt-1 text-[11px] text-mist">
          {row.durationHours}h ·{" "}
          <DifficultyMeter difficulty={row.difficulty} showLabel={false} />
        </p>
      </ValueCell>

      <ValueCell highlight={isBestPrice}>
        <p className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
          {formatInr(row.basePrice)}
        </p>
        <p className="text-[10px] text-mist sm:text-[11px]">
          {isBestPrice ? "Best price · per person" : "per person"}
        </p>
      </ValueCell>

      <ValueCell>
        <div className="flex flex-wrap gap-1">
          <ExperienceBadge score={row.operator.experienceScore} compact />
          <SafetyBadge score={row.operator.safetyScore} compact />
        </div>
      </ValueCell>

      <ValueCell>
        <p className="text-xs text-body sm:text-sm">{row.womenPctLabel}</p>
      </ValueCell>

      <ValueCell>
        <p className="text-[11px] leading-snug text-body sm:text-xs">
          {row.cancellationLabel}
        </p>
      </ValueCell>

      <ValueCell>
        <p className="text-[11px] leading-snug text-mist sm:text-xs">
          {formatWhen(row.nextDeparture)}
        </p>
      </ValueCell>

      <ValueCell className="border-b-0">
        <span className="inline-flex w-full items-center justify-center rounded-full bg-amber/15 px-3 py-2 text-[11px] font-bold text-amber-deep transition-colors group-hover:bg-amber group-hover:text-amber-text sm:text-xs">
          View details
        </span>
      </ValueCell>
    </button>
  );
}

export function CompareClient({ bundle }: { bundle: PlaceCompareBundle }) {
  const { place, listings } = bundle;
  const reduce = useReducedMotion();
  const lowestPrice = listings[0]?.basePrice ?? 0;
  const [selected, setSelected] = useState<CompareListingRow | null>(null);

  return (
    <div className="page-shell pt-28 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-eyebrow text-amber-deep">
            Compare operators
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">
            {place.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-mist">
            <MapPin size={14} />
            {place.city}, {place.district} · {listings.length} operators
          </p>
          <p className="mt-2 text-sm text-mist">
            Tap any column for full trip and operator details.
          </p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.4, ease: brandEase }}
          className="flex w-full gap-x-2 sm:gap-x-3"
        >
          <div className="w-[3.25rem] shrink-0 sm:w-[5.5rem]">
            <LabelCell className="min-h-[9rem] border-b-0 sm:min-h-[10rem]">
              Operator
            </LabelCell>
            <LabelCell>Trip</LabelCell>
            <LabelCell>Price</LabelCell>
            <LabelCell>Trust</LabelCell>
            <LabelCell>Mix</LabelCell>
            <LabelCell>Cancel</LabelCell>
            <LabelCell>Next</LabelCell>
            <LabelCell className="border-b-0">Details</LabelCell>
          </div>

          {listings.map((row, index) => (
            <CompareColumn
              key={row.id}
              row={row}
              lowestPrice={lowestPrice}
              divider={index < listings.length - 1}
              onOpen={setSelected}
            />
          ))}
        </motion.div>

        <p className="mt-10 text-sm text-mist">
          <Link
            href="/discover"
            className="font-semibold text-amber-deep hover:underline"
          >
            Back to Discover
          </Link>
        </p>
      </div>

      <CompareDetailModal
        row={selected}
        onClose={() => setSelected(null)}
        isBestPrice={selected?.basePrice === lowestPrice}
      />
    </div>
  );
}
