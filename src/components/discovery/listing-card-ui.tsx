"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock, Users, BadgeCheck, Images } from "lucide-react";
import type { ListingCardData } from "@/types/listing";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import { CategoryIcon } from "@/components/ui/category-icon";
import { DifficultyMeter, StarRating } from "@/components/ui/primitives";
import { TrustScoreRow } from "@/components/ui/trust-badges";
import { TiltShell } from "@/components/ui/tilt-shell";
import { brandEase, softSpring } from "@/lib/motion";

function photoCount(listing: ListingCardData): number {
  const urls = new Set<string>();
  if (listing.heroImageUrl) urls.add(listing.heroImageUrl);
  for (const url of listing.galleryUrls ?? []) {
    if (url) urls.add(url);
  }
  return urls.size;
}

/** Pattern 10 - listing cards tilt toward cursor on desktop. */
export function ListingCardUi({
  listing,
  index = 0,
  comparePlaceSlug,
  compareOperatorCount,
}: {
  listing: ListingCardData;
  index?: number;
  comparePlaceSlug?: string;
  compareOperatorCount?: number;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const photos = photoCount(listing);
  const peekUrl = listing.galleryUrls?.find(
    (u) => u && u !== listing.heroImageUrl,
  );
  const imageStyle = listingImageStyle(
    listing.category.slug,
    listing.heroImageUrl,
  );
  const peekStyle = peekUrl
    ? listingImageStyle(listing.category.slug, peekUrl)
    : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 0.4,
              delay: (index % 3) * 0.07,
              ease: brandEase,
            }
      }
      whileTap={reduce ? undefined : { scale: 0.985, transition: softSpring }}
      className="h-full [perspective:1100px]"
    >
      <TiltShell
        enabled={!reduce}
        className="group h-full rounded-[var(--radius-card)]"
      >
        <Link href={`/listings/${listing.slug}`} className="block h-full">
          <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line/80 bg-white shadow-[var(--shadow-sm)] transition-shadow duration-300 group-hover:shadow-[var(--shadow-md)]">
            <div className="relative h-44 overflow-hidden">
              {peekStyle ? (
                <div
                  className="absolute inset-0 translate-x-2 translate-y-1 scale-[0.92] opacity-0 transition-all duration-300 group-hover:translate-x-3 group-hover:opacity-55"
                  style={peekStyle}
                  aria-hidden
                />
              ) : null}
              <div
                className="absolute inset-0 transition-transform duration-500 ease-brand group-hover:scale-[1.04]"
                style={imageStyle}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
              </div>
              <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-[10px] font-semibold text-paper backdrop-blur">
                  <CategoryIcon slug={listing.category.slug} size={11} />
                  {listing.category.name}
                </span>
                <span className="rounded-full bg-white/95 px-2 py-1 shadow-sm backdrop-blur">
                  <DifficultyMeter
                    difficulty={listing.difficulty}
                    showLabel={false}
                  />
                </span>
              </div>
              {photos > 1 ? (
                <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold text-paper backdrop-blur">
                  <Images size={11} />
                  {photos} photos
                </span>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col space-y-3 p-4 sm:p-5">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-mist">
                <MapPin size={11} />
                {listing.place.city}, {listing.place.district}
              </p>

              <h3 className="line-clamp-2 font-display text-base font-bold leading-snug tracking-tight">
                {listing.title}
              </h3>

              <div className="space-y-2 text-xs text-[#54635A]">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={12} className="shrink-0 text-mist" />
                    {listing.minGroupSize}–{listing.maxGroupSize} people
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} className="shrink-0 text-mist" />
                    {listing.durationHours}h
                  </span>
                </div>
                <p className="flex min-w-0 items-center gap-2 text-mist">
                  <BadgeCheck size={12} className="shrink-0 text-forest" />
                  <span className="truncate">
                    {listing.operator.businessName}
                  </span>
                </p>
                <TrustScoreRow
                  experienceScore={listing.operator.experienceScore}
                  safetyScore={listing.operator.safetyScore}
                />
                {comparePlaceSlug && compareOperatorCount && compareOperatorCount >= 2 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/compare/${comparePlaceSlug}`);
                    }}
                    className="inline-block text-left text-[11px] font-bold text-forest hover:underline"
                  >
                    Compare {compareOperatorCount} operators at {listing.place.city}
                  </button>
                ) : null}
              </div>

              <div className="mt-auto flex items-end justify-between border-t border-line/70 pt-3">
                <div className="text-sm">
                  <span className="text-[11px] text-mist">from </span>
                  <span className="font-display text-lg font-bold tracking-tight">
                    {formatInr(listing.basePrice)}
                  </span>
                  <span className="text-[11px] text-mist"> /person</span>
                </div>
                <StarRating
                  rating={listing.ratingAvg}
                  count={listing.ratingCount}
                />
              </div>
            </div>
          </div>
        </Link>
      </TiltShell>
    </motion.div>
  );
}
