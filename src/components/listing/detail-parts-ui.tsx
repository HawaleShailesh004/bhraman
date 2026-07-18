"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Minus,
  Plus,
  Shield,
  CloudSun,
  Backpack,
  X,
  Star,
  BadgeCheck,
  CalendarCheck2,
  UsersRound,
} from "lucide-react";
import type { ListingDetailData } from "@/types/listing";
import type { WeatherSignal } from "@/lib/weather";
import { formatInr } from "@/lib/format";
import { softSpring, springTap } from "@/lib/motion";
import { listingImageStyle } from "@/lib/ui-present";
import { OperatorAvatar } from "@/components/ui/operator-avatar";
import { Button, StarRating } from "@/components/ui/primitives";
import { EscrowReserveNote } from "@/components/home/proof-and-operators";
import type { ReviewData } from "@/types/listing";
import type { AvailabilitySlotData } from "@/types/listing";

export function UpcomingBatchTrustUi({
  listing,
}: {
  listing: ListingDetailData;
}) {
  const [slots, setSlots] = useState<AvailabilitySlotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/listings/${listing.slug}/availability`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : []))
      .then((rows: AvailabilitySlotData[]) => {
        if (active) setSlots(rows.slice(0, 2));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [listing.slug]);

  if (loading) {
    return (
      <div className="rounded-[22px] border border-forest/15 bg-[#EAF1EC] p-5">
        <div className="h-3 w-36 rounded skeleton-shimmer" />
        <div className="mt-4 h-20 rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  if (slots.length === 0) return null;

  return (
    <div className="rounded-[22px] border border-forest/15 bg-[#EAF1EC] p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-2">
        <CalendarCheck2 size={18} className="mt-0.5 shrink-0 text-forest" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-forest">Upcoming departures</p>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-mist">
            Live booking progress to help you choose your batch.
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {slots.map((slot, index) => {
          const remaining =
            slot.minSeatsToConfirm === null
              ? null
              : Math.max(slot.minSeatsToConfirm - slot.confirmedSeats, 0);
          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="min-w-0 rounded-lg border border-white/70 bg-white/75 p-3 text-sm"
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">
                  {new Date(slot.startTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    weekday: "short",
                  })}
                </span>
                <span className="break-words text-xs font-bold text-forest">
                  {slot.status === "CONFIRMED" || slot.status === "FULL"
                    ? "Departure confirmed"
                    : remaining !== null
                      ? `${remaining} seats to confirm`
                      : `${slot.seatsLeft} seats left`}
                </span>
              </div>
              <p className="mt-1.5 flex min-w-0 items-start gap-1.5 break-words text-xs text-body-muted">
                <UsersRound size={13} className="mt-0.5 shrink-0" />
                <span>
                  {slot.femaleCount + slot.maleCount + slot.otherCount === 0
                    ? "Be the first to book this departure"
                    : `Lead travelers: ${slot.femaleCount} women · ${slot.maleCount} men${
                        slot.otherCount > 0 ? ` · ${slot.otherCount} other` : ""
                      }`}
                </span>
              </p>
              {slot.minSeatsToConfirm !== null ? (
                <div className="mt-3">
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-paper-2"
                    role="progressbar"
                    aria-label="Departure confirmation progress"
                    aria-valuemin={0}
                    aria-valuemax={slot.minSeatsToConfirm}
                    aria-valuenow={Math.min(
                      slot.confirmedSeats,
                      slot.minSeatsToConfirm,
                    )}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          100,
                          (slot.confirmedSeats / slot.minSeatsToConfirm) * 100,
                        )}%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-forest"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-mist">
                    {slot.confirmedSeats} of {slot.minSeatsToConfirm} seats
                    needed for departure
                  </p>
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function WeatherSignalUi({ weather }: { weather: WeatherSignal }) {
  const isGood = weather.label === "Good to go";
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
      style={{
        background: isGood
          ? "linear-gradient(135deg,#EAF1EC,#F2EEE4)"
          : "linear-gradient(135deg,#FBEEDD,#F2EEE4)",
      }}
    >
      <div className="min-w-0">
        <div
          className={`mb-1 flex items-center gap-2 text-[15px] font-extrabold ${
            isGood ? "text-forest" : "text-amber-deep"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isGood ? "bg-forest" : "bg-amber-deep"
            }`}
            style={{
              boxShadow: isGood
                ? "0 0 0 4px rgba(45,90,61,0.18)"
                : "0 0 0 4px rgba(201,116,28,0.18)",
            }}
          />
          {weather.label}
        </div>
        <p className="flex min-w-0 items-start gap-1.5 break-words text-[13px] leading-relaxed text-mist">
          <CloudSun size={14} className="mt-0.5 shrink-0" /> {weather.summary}
        </p>
      </div>
      {weather.temperatureC !== null ? (
        <div className="shrink-0 font-display text-[clamp(1.75rem,6vw,2.375rem)] font-extrabold tracking-tight">
          {weather.temperatureC}°
        </div>
      ) : null}
    </div>
  );
}

export function OperatorBlockUi({ listing }: { listing: ListingDetailData }) {
  const op = listing.operator;

  return (
    <div className="rounded-[22px] border border-line bg-white p-4 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="mb-5 flex min-w-0 items-center gap-3.5">
        <OperatorAvatar
          name={op.businessName}
          src={op.logoUrl}
          size="lg"
          rounded="xl"
        />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 font-display text-lg font-extrabold">
            <Link
              href={`/operators/${op.slug}`}
              className="min-w-0 break-words hover:text-forest"
            >
              {op.businessName}
            </Link>
            {op.isVerified ? (
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-forest">
                <Check size={11} className="text-paper" strokeWidth={3} />
              </span>
            ) : null}
          </div>
          <div className="break-words text-[13px] text-mist">
            {op.baseCity} ·{" "}
            {op.isVerified ? "Verified on Bhraman" : "Verification pending"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
          {
            b: op.completedTrips.toLocaleString("en-IN"),
            s: "TRIPS RUN",
            star: false,
          },
          {
            b: op.ratingCount > 0 ? op.ratingAvg.toFixed(1) : "New",
            s: "RATING",
            star: op.ratingCount > 0,
          },
          { b: `~${op.avgResponseMins}m`, s: "RESPONDS IN", star: false },
        ].map((t) => (
          <div
            key={t.s}
            className="flex items-center justify-between rounded-lg bg-paper-2 p-3 sm:block sm:text-center"
          >
            <div className="flex items-center gap-1 font-display text-xl font-extrabold text-forest sm:justify-center">
              {t.b}
              {t.star ? (
                <Star
                  size={14}
                  className="fill-amber text-amber-deep"
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="text-[10px] font-semibold tracking-wide text-mist">
              {t.s}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        {op.yearsOperating !== null ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-semibold text-[#33433A]">
            <BadgeCheck size={13} className="shrink-0 text-forest" />
            {op.yearsOperating}+ years operating
          </span>
        ) : null}
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            op.insuranceStatus
              ? "bg-[#EAF1EC] text-forest"
              : "bg-paper-2 text-mist"
          }`}
        >
          <Shield size={13} className="shrink-0" />
          {op.insuranceStatus
            ? `Insurance${op.insuranceProvider ? ` · ${op.insuranceProvider}` : ""}`
            : "Insurance not verified"}
        </span>
        {op.totalGuideCount > 0 ? (
          <span className="inline-flex shrink-0 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-semibold text-[#33433A]">
            {op.femaleGuideCount} of {op.totalGuideCount} guides are women
          </span>
        ) : null}
      </div>
      <p className="mt-4 break-words text-sm leading-relaxed text-[#54635A]">
        {op.bio}
      </p>
      <Link
        href={`/operators/${op.slug}`}
        className="mt-4 inline-flex text-sm font-bold text-amber-deep hover:underline"
      >
        View full operator profile →
      </Link>
    </div>
  );
}

export function ItineraryTimelineUi({ listing }: { listing: ListingDetailData }) {
  return (
    <div className="relative min-w-0 overflow-x-clip pl-7 sm:pl-8">
      <div
        className="absolute bottom-1.5 left-2 top-1.5 w-0.5"
        style={{ background: "linear-gradient(var(--amber),var(--line))" }}
      />
      {listing.itinerary.map((step, i) => (
        <motion.div
          key={step.order}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="relative min-w-0 pb-7 last:pb-0"
        >
          <div
            className="absolute -left-[1.375rem] top-0.5 h-[18px] w-[18px] rounded-full border-[3px] border-amber bg-white sm:-left-8"
            style={{ boxShadow: "0 0 0 4px var(--paper)" }}
          />
          {step.timeLabel ? (
            <div className="mb-1 font-display text-[13px] font-extrabold tracking-wide text-amber-deep">
              {step.timeLabel}
            </div>
          ) : null}
          <div className="mb-1 break-words text-base font-bold">{step.title}</div>
          {step.description ? (
            <p className="break-words text-sm leading-relaxed text-[#54635A]">
              {step.description}
            </p>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}

export function BookingPanelUi({ listing }: { listing: ListingDetailData }) {
  const reduce = useReducedMotion();
  const [group, setGroup] = useState(Math.max(2, listing.minGroupSize));
  const subtotal = listing.basePrice * group;
  const total = subtotal;
  const cutoff = listing.cancellationPolicy.cutoffHours;

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-[var(--shadow-lg)] sm:p-6 lg:sticky lg:top-24">
      <div className="mb-5 flex items-baseline gap-1.5">
        <span className="font-display text-[clamp(1.5rem,4vw,1.875rem)] font-extrabold">
          {formatInr(listing.basePrice)}
        </span>
        <span className="text-sm text-mist">/ person</span>
      </div>

      <div className="mb-3 rounded-lg border border-line p-3.5">
        <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-mist">
          Group size
        </div>
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            aria-label="Decrease group size"
            onClick={() => setGroup(Math.max(listing.minGroupSize, group - 1))}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            transition={springTap}
            className="touch-target grid place-items-center rounded-full border-[1.5px] border-line transition-colors hover:border-ink"
          >
            <Minus size={16} />
          </motion.button>
          <motion.span
            key={group}
            initial={reduce ? false : { scale: 0.92, opacity: 0.55 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={softSpring}
            className="text-[15px] font-semibold"
          >
            {group} people
          </motion.span>
          <motion.button
            type="button"
            aria-label="Increase group size"
            onClick={() => setGroup(Math.min(listing.maxGroupSize, group + 1))}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            transition={springTap}
            className="touch-target grid place-items-center rounded-full border-[1.5px] border-line transition-colors hover:border-ink"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </div>

      <div className="mb-4 space-y-2.5 border-t border-dashed border-line pt-4 text-sm">
        <div className="flex justify-between text-body-muted">
          <span>
            {formatInr(listing.basePrice)} × {group}
          </span>
          <motion.span
            key={subtotal}
            initial={reduce ? false : { opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {formatInr(subtotal)}
          </motion.span>
        </div>
        <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold">
          <span>Total</span>
          <motion.span
            key={`total-${total}`}
            initial={reduce ? false : { opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {formatInr(total)}
          </motion.span>
        </div>
      </div>

      <Button href={`/book/${listing.slug}`} full className="py-3.5 text-center">
        Reserve now
      </Button>
      <EscrowReserveNote />
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-mist">
        <Shield size={13} /> Free cancellation up to {cutoff}h · Secure payment
      </p>
    </div>
  );
}

export function ReviewsUi({ reviews, ratingAvg, ratingCount }: {
  reviews: ReviewData[];
  ratingAvg: number;
  ratingCount: number;
}) {
  if (ratingCount === 0 || reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white px-8 py-10 text-center">
        <Star className="mx-auto text-mist" size={28} />
        <h3 className="mt-3 font-display text-lg">No reviews yet</h3>
        <p className="mt-1 text-sm text-mist">
          Be among the first adventurers to book and share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-3">
        <StarRating rating={ratingAvg} />
        <span className="text-sm text-mist">· {ratingCount} reviews</span>
      </div>
      {reviews.map((r) => {
        const initials = r.user.name
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0])
          .join("")
          .toUpperCase();
        const date = new Intl.DateTimeFormat("en-IN", {
          month: "short",
          year: "numeric",
        }).format(new Date(r.createdAt));

        return (
          <div
            key={r.id}
            className="bg-white border border-line rounded-[14px] p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="mb-3 flex min-w-0 items-center gap-3">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#4C8055,#2D5A3D)",
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-[15px] font-bold">
                  <span className="break-words">{r.user.name}</span>
                  {r.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1EC] px-2 py-0.5 text-[10px] font-bold text-forest">
                      <Check size={10} strokeWidth={3} aria-hidden />
                      Verified
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-mist">
                  Booked via Bhraman · {date}
                </div>
              </div>
            </div>
            <div className="mb-2">
              <StarRating rating={r.rating} />
            </div>
            <p className="break-words text-sm leading-relaxed text-[#33433A]">
              {r.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function InclusionsUi({ listing }: { listing: ListingDetailData }) {
  return (
    <div className="grid min-w-0 gap-x-10 gap-y-6 sm:grid-cols-2">
      <div className="min-w-0">
        <h4 className="mb-3 flex items-center gap-2 font-display text-base">
          <Check size={18} className="shrink-0 text-forest" /> What&apos;s
          included
        </h4>
        <ul className="space-y-2">
          {listing.inclusions.map((x) => (
            <li
              key={x}
              className="flex items-start gap-2 break-words text-sm text-[#33433A]"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-forest" /> {x}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">
        <h4 className="mb-3 flex items-center gap-2 font-display text-base">
          <X size={18} className="shrink-0 text-clay" /> Not included
        </h4>
        <ul className="space-y-2">
          {listing.exclusions.map((x) => (
            <li
              key={x}
              className="flex items-start gap-2 break-words text-sm text-[#33433A]"
            >
              <X size={16} className="mt-0.5 shrink-0 text-clay" /> {x}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0 sm:col-span-2">
        <h4 className="mb-3 flex items-center gap-2 font-display text-base">
          <Backpack size={18} className="shrink-0 text-amber-deep" /> Things to
          carry
        </h4>
        <div className="flex flex-wrap gap-2">
          {listing.thingsToCarry.map((x) => (
            <span
              key={x}
              className="max-w-full break-words rounded-full bg-paper-2 px-3 py-1.5 text-sm"
            >
              {x}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListingHeroImage({ listing }: { listing: ListingDetailData }) {
  return (
    <div
      className="relative h-[min(68vh,720px)] min-h-[340px] overflow-hidden sm:min-h-[480px]"
      style={listingImageStyle(listing.category.slug, listing.heroImageUrl)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
    </div>
  );
}
