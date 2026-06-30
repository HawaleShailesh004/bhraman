"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
  Plus,
  Shield,
  CloudSun,
  Backpack,
  X,
  Star,
} from "lucide-react";
import type { ListingDetailData } from "@/types/listing";
import type { WeatherSignal } from "@/lib/weather";
import { formatInr } from "@/lib/format";
import { listingImageStyle, operatorInitials } from "@/lib/ui-present";
import { StarRating } from "@/components/ui/primitives";
import type { ReviewData } from "@/types/listing";

const PLATFORM_FEE_RATE = 0.05;

export function WeatherSignalUi({ weather }: { weather: WeatherSignal }) {
  const isGood = weather.label === "Good to go";
  return (
    <div
      className="rounded-[22px] border border-line p-5 flex items-center justify-between"
      style={{ background: "linear-gradient(135deg,#EAF1EC,#F2EEE4)" }}
    >
      <div>
        <div className="flex items-center gap-2 font-extrabold text-forest text-[15px] mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full bg-forest"
            style={{ boxShadow: "0 0 0 4px rgba(45,90,61,0.18)" }}
          />
          {weather.label}
        </div>
        <p className="text-mist text-[13px] flex items-center gap-1.5">
          <CloudSun size={14} /> {weather.summary}
        </p>
      </div>
      {weather.temperatureC !== null ? (
        <div className="font-display font-extrabold text-[38px] tracking-tight">
          {weather.temperatureC}°
        </div>
      ) : null}
    </div>
  );
}

export function OperatorBlockUi({ listing }: { listing: ListingDetailData }) {
  const op = listing.operator;
  const initials = operatorInitials(op.businessName);

  return (
    <div className="bg-white border border-line rounded-[22px] p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3.5 mb-5">
        <div
          className="w-14 h-14 rounded-2xl grid place-items-center text-paper font-display font-extrabold text-xl"
          style={{ background: "linear-gradient(135deg,#2D5A3D,#1A2E22)" }}
        >
          {initials}
        </div>
        <div>
          <div className="font-display font-extrabold text-lg flex items-center gap-2">
            {op.businessName}
            {op.isVerified ? (
              <span className="w-[18px] h-[18px] bg-forest rounded-full grid place-items-center">
                <Check size={11} className="text-paper" strokeWidth={3} />
              </span>
            ) : null}
          </div>
          <div className="text-mist text-[13px]">
            {op.baseCity} · Verified on Bhraman
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { b: op.completedTrips.toLocaleString("en-IN"), s: "TRIPS RUN", star: false },
          { b: String(op.ratingAvg), s: "RATING", star: true },
          { b: `~${op.avgResponseMins}m`, s: "RESPONDS IN", star: false },
        ].map((t) => (
          <div key={t.s} className="bg-paper-2 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 font-display text-xl font-extrabold text-forest">
              {t.b}
              {t.star ? <Star size={14} className="fill-amber text-amber-deep" aria-hidden /> : null}
            </div>
            <div className="text-mist text-[10px] font-semibold tracking-wide">{t.s}</div>
          </div>
        ))}
      </div>
      <p className="text-[#54635A] text-sm mt-4 leading-relaxed">{op.bio}</p>
    </div>
  );
}

export function ItineraryTimelineUi({ listing }: { listing: ListingDetailData }) {
  return (
    <div className="relative pl-8">
      <div
        className="absolute left-2 top-1.5 bottom-1.5 w-0.5"
        style={{ background: "linear-gradient(var(--amber),var(--line))" }}
      />
      {listing.itinerary.map((step, i) => (
        <motion.div
          key={step.order}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="relative pb-7 last:pb-0"
        >
          <div
            className="absolute -left-8 top-0.5 w-[18px] h-[18px] rounded-full bg-white border-[3px] border-amber"
            style={{ boxShadow: "0 0 0 4px var(--paper)" }}
          />
          {step.timeLabel ? (
            <div className="font-display font-extrabold text-[13px] text-amber-deep tracking-wide mb-1">
              {step.timeLabel}
            </div>
          ) : null}
          <div className="font-bold text-base mb-1">{step.title}</div>
          {step.description ? (
            <p className="text-[#54635A] text-sm leading-relaxed">{step.description}</p>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}

export function BookingPanelUi({ listing }: { listing: ListingDetailData }) {
  const [group, setGroup] = useState(Math.max(2, listing.minGroupSize));
  const subtotal = listing.basePrice * group;
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + fee;
  const cutoff = listing.cancellationPolicy.cutoffHours;

  return (
    <div className="bg-white border border-line rounded-[22px] p-6 shadow-[var(--shadow-lg)] lg:sticky lg:top-24">
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="font-display font-extrabold text-[30px]">
          {formatInr(listing.basePrice)}
        </span>
        <span className="text-mist text-sm">/ person</span>
      </div>

      <div className="border border-line rounded-lg p-3.5 mb-3">
        <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-mist mb-0.5">
          Group size
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setGroup(Math.max(listing.minGroupSize, group - 1))}
            className="w-8 h-8 rounded-full border-[1.5px] border-line grid place-items-center hover:border-ink transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="font-semibold text-[15px]">{group} people</span>
          <button
            type="button"
            onClick={() => setGroup(Math.min(listing.maxGroupSize, group + 1))}
            className="w-8 h-8 rounded-full border-[1.5px] border-line grid place-items-center hover:border-ink transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="border-t border-dashed border-line pt-4 mb-4 text-sm space-y-2.5">
        <div className="flex justify-between text-[#54635A]">
          <span>
            {formatInr(listing.basePrice)} × {group}
          </span>
          <span>{formatInr(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[#54635A]">
          <span>Platform fee</span>
          <span>{formatInr(fee)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2.5 border-t border-line">
          <span>Total</span>
          <span>{formatInr(total)}</span>
        </div>
      </div>

      <Link
        href={`/book/${listing.slug}`}
        className="block text-center w-full bg-amber text-[#3A2406] rounded-full py-3.5 font-bold shadow-[0_8px_20px_rgba(224,138,43,0.32)] hover:-translate-y-0.5 transition-transform"
      >
        Reserve now
      </Link>
      <p className="flex items-center justify-center gap-1.5 text-mist text-xs mt-3">
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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <StarRating rating={ratingAvg} />
        <span className="text-mist text-sm">· {ratingCount} reviews</span>
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
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full grid place-items-center text-white font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg,#4C8055,#2D5A3D)",
                }}
              >
                {initials}
              </div>
              <div>
                <div className="font-bold text-[15px] flex items-center gap-2">
                  {r.user.name}
                  {r.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1EC] px-2 py-0.5 text-[10px] font-bold text-forest">
                      <Check size={10} strokeWidth={3} aria-hidden />
                      Verified
                    </span>
                  ) : null}
                </div>
                <div className="text-mist text-xs">Booked via Bhraman · {date}</div>
              </div>
            </div>
            <div className="mb-2">
              <StarRating rating={r.rating} />
            </div>
            <p className="text-[#33433A] text-sm leading-relaxed">{r.comment}</p>
          </div>
        );
      })}
    </div>
  );
}

export function InclusionsUi({ listing }: { listing: ListingDetailData }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
      <div>
        <h4 className="font-display text-base mb-3 flex items-center gap-2">
          <Check size={18} className="text-forest" /> What&apos;s included
        </h4>
        <ul className="space-y-2">
          {listing.inclusions.map((x) => (
            <li key={x} className="flex items-start gap-2 text-sm text-[#33433A]">
              <Check size={16} className="text-forest mt-0.5 shrink-0" /> {x}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-display text-base mb-3 flex items-center gap-2">
          <X size={18} className="text-clay" /> Not included
        </h4>
        <ul className="space-y-2">
          {listing.exclusions.map((x) => (
            <li key={x} className="flex items-start gap-2 text-sm text-[#33433A]">
              <X size={16} className="text-clay mt-0.5 shrink-0" /> {x}
            </li>
          ))}
        </ul>
      </div>
      <div className="sm:col-span-2">
        <h4 className="font-display text-base mb-3 flex items-center gap-2">
          <Backpack size={18} className="text-amber-deep" /> Things to carry
        </h4>
        <div className="flex flex-wrap gap-2">
          {listing.thingsToCarry.map((x) => (
            <span key={x} className="text-sm bg-paper-2 px-3 py-1.5 rounded-full">
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
      className="relative h-[68vh] min-h-[480px] overflow-hidden"
      style={listingImageStyle(listing.category.slug, listing.heroImageUrl)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
    </div>
  );
}
