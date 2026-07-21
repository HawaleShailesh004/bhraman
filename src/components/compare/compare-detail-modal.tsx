"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Backpack,
  BadgeCheck,
  Calendar,
  Check,
  MapPin,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react";
import type { CompareListingRow } from "@/lib/compare";
import { formatInr } from "@/lib/format";
import { brandEase } from "@/lib/motion";
import { listingImageStyle, DIFFICULTY_META } from "@/lib/ui-present";
import { ExperienceBadge, SafetyBadge } from "@/components/ui/trust-badges";
import { DifficultyMeter, StarRating } from "@/components/ui/primitives";
import { OperatorAvatar } from "@/components/ui/operator-avatar";

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

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line/70 pt-5">
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function CompareDetailModal({
  row,
  onClose,
  isBestPrice = false,
}: {
  row: CompareListingRow | null;
  onClose: () => void;
  isBestPrice?: boolean;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!row) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [row, onClose]);

  const imageStyle = row
    ? listingImageStyle(row.category.slug, row.heroImageUrl)
    : undefined;

  return (
    <AnimatePresence>
      {row ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-end bg-ink/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-detail-title"
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={
              reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={
              reduce ? { duration: 0 } : { duration: 0.3, ease: brandEase }
            }
            className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] border border-line bg-white shadow-[var(--shadow-lg)] sm:max-w-2xl sm:rounded-[22px]"
          >
            <div className="relative h-40 shrink-0 overflow-hidden sm:h-48">
              <div className="absolute inset-0" style={imageStyle} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <button
                type="button"
                aria-label="Close details"
                onClick={onClose}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/50"
              >
                <X size={18} />
              </button>
              {isBestPrice ? (
                <span className="absolute left-4 top-4 rounded-full bg-amber px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-text">
                  Best price
                </span>
              ) : null}
              <div className="absolute inset-x-4 bottom-4">
                <p className="flex items-center gap-1.5 font-display text-xl font-bold text-white">
                  {row.operator.isVerified ? (
                    <BadgeCheck size={18} className="shrink-0 text-amber" />
                  ) : null}
                  {row.operator.businessName}
                </p>
                <div className="mt-1 text-white [&_.text-mist]:text-white/75 [&_.text-ink]:text-white">
                  <StarRating rating={row.ratingAvg} count={row.ratingCount} />
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-eyebrow text-amber-deep">
                  {row.category.name}
                </p>
                <h2
                  id="compare-detail-title"
                  className="mt-1 font-display text-2xl font-bold leading-tight text-ink"
                >
                  {row.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-body">
                  {row.summary}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[14px] bg-paper px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
                    Price
                  </p>
                  <p className="mt-1 font-display text-lg font-bold">
                    {formatInr(row.basePrice)}
                  </p>
                </div>
                <div className="rounded-[14px] bg-paper px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-semibold">{row.durationHours}h</p>
                </div>
                <div className="rounded-[14px] bg-paper px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
                    Difficulty
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {DIFFICULTY_META[row.difficulty].label}
                  </p>
                </div>
                <div className="rounded-[14px] bg-paper px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-mist">
                    Group
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {row.minGroupSize}–{row.maxGroupSize}
                  </p>
                </div>
              </div>

              <DetailSection title="About this trip">
                <p className="text-sm leading-relaxed text-body">
                  {row.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ExperienceBadge score={row.operator.experienceScore} />
                  <SafetyBadge score={row.operator.safetyScore} />
                </div>
              </DetailSection>

              <DetailSection title="Departure & batch">
                <div className="space-y-2 text-sm text-body">
                  <p className="flex items-start gap-2">
                    <Calendar size={15} className="mt-0.5 shrink-0 text-mist" />
                    Next: {formatWhen(row.nextDeparture)}
                  </p>
                  <p className="flex items-start gap-2">
                    <Users size={15} className="mt-0.5 shrink-0 text-mist" />
                    Batch mix: {row.womenPctLabel}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-mist" />
                    {row.place.city}, {row.place.district}
                  </p>
                  {row.meetingPoint ? (
                    <p className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-mist" />
                      Meet: {row.meetingPoint}
                    </p>
                  ) : null}
                </div>
              </DetailSection>

              <DetailSection title="Cancellation policy">
                <div className="rounded-[14px] bg-[#EAF1EC] px-4 py-3 text-sm text-body">
                  <p className="flex items-start gap-2">
                    <Shield size={15} className="mt-0.5 shrink-0 text-forest" />
                    {row.cancellationLabel}
                  </p>
                  <p className="mt-2 text-xs text-mist">
                    Weather cancel: {row.cancellationPolicy.weatherRefundPct}%
                    refund · No-show: {row.cancellationPolicy.noShowPct}%
                  </p>
                </div>
              </DetailSection>

              {row.itinerary.length > 0 ? (
                <DetailSection title="Itinerary">
                  <ol className="space-y-3">
                    {row.itinerary.map((step) => (
                      <li
                        key={step.order}
                        className="rounded-[14px] border border-line/70 px-4 py-3"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-mist">
                          {step.timeLabel ?? `Step ${step.order}`}
                        </p>
                        <p className="mt-1 font-semibold text-ink">{step.title}</p>
                        {step.description ? (
                          <p className="mt-1 text-sm text-body">
                            {step.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </DetailSection>
              ) : null}

              <DetailSection title="What's included">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Check size={16} className="text-forest" /> Included
                    </p>
                    <ul className="space-y-1.5 text-sm text-body">
                      {row.inclusions.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check size={14} className="mt-0.5 shrink-0 text-forest" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <X size={16} className="text-clay" /> Not included
                    </p>
                    <ul className="space-y-1.5 text-sm text-body">
                      {row.exclusions.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <X size={14} className="mt-0.5 shrink-0 text-clay" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {row.thingsToCarry.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Backpack size={16} className="text-amber-deep" /> Things
                      to carry
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {row.thingsToCarry.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-body"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </DetailSection>

              <DetailSection title="Operator">
                <div className="flex items-start gap-3">
                  <OperatorAvatar
                    name={row.operator.businessName}
                    src={row.operator.logoUrl}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {row.operator.businessName}
                    </p>
                    <p className="text-sm text-mist">{row.operator.baseCity}</p>
                    <p className="mt-2 text-sm leading-relaxed text-body">
                      {row.operator.bio}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-body sm:grid-cols-3">
                      {row.operator.yearsOperating ? (
                        <span>{row.operator.yearsOperating}+ yrs operating</span>
                      ) : null}
                      <span>{row.operator.completedTrips} trips done</span>
                      <span>~{row.operator.avgResponseMins}m response</span>
                      {row.operator.totalGuideCount > 0 ? (
                        <span>
                          {row.operator.femaleGuideCount}/
                          {row.operator.totalGuideCount} female guides
                        </span>
                      ) : null}
                      {row.operator.insuranceStatus ? (
                        <span className="col-span-2 sm:col-span-3">
                          Insured
                          {row.operator.insuranceProvider
                            ? ` · ${row.operator.insuranceProvider}`
                            : ""}
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/operators/${row.operator.slug}`}
                      className="mt-3 inline-block text-sm font-bold text-forest hover:underline"
                    >
                      View operator profile →
                    </Link>
                  </div>
                </div>
              </DetailSection>

              {row.reviews.length > 0 ? (
                <DetailSection title="Reviews">
                  <div className="space-y-3">
                    {row.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-[14px] border border-line/70 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">
                            {review.user.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold">
                            <Star size={12} className="fill-amber text-amber" />
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-body">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-line/70 bg-white px-5 py-4 sm:px-6">
              <Link
                href={`/listings/${row.slug}`}
                className="flex w-full items-center justify-center rounded-full bg-amber px-5 py-3 text-sm font-bold text-amber-text transition-opacity hover:opacity-90"
              >
                Book this trip
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
