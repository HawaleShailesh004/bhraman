"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, BadgeCheck, Images } from "lucide-react";
import type { ListingCardData } from "@/types/listing";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import { CategoryIcon } from "@/components/ui/category-icon";
import { DifficultyMeter, StarRating } from "@/components/ui/primitives";

function photoCount(listing: ListingCardData): number {
  const urls = new Set<string>();
  if (listing.heroImageUrl) urls.add(listing.heroImageUrl);
  for (const url of listing.galleryUrls ?? []) {
    if (url) urls.add(url);
  }
  return urls.size;
}

export function ListingCardUi({
  listing,
  index = 0,
}: {
  listing: ListingCardData;
  index?: number;
}) {
  const photos = photoCount(listing);
  const peekUrl = listing.galleryUrls?.find((u) => u && u !== listing.heroImageUrl);
  const imageStyle = listingImageStyle(
    listing.category.slug,
    listing.heroImageUrl
  );
  const peekStyle = peekUrl
    ? listingImageStyle(listing.category.slug, peekUrl)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: (index % 3) * 0.06,
        ease: [0.22, 0.61, 0.36, 1],
      }}
    >
      <Link href={`/listings/${listing.slug}`} className="group block">
        <div
          className="overflow-hidden rounded-[var(--radius-card)] border border-line/80 bg-white shadow-[var(--shadow-sm)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-md)]"
        >
          <div className="relative h-44 overflow-hidden">
            {peekStyle ? (
              <div
                className="absolute inset-0 scale-[0.92] translate-x-2 translate-y-1 opacity-0 transition-all duration-300 group-hover:opacity-55 group-hover:translate-x-3"
                style={peekStyle}
                aria-hidden
              />
            ) : null}
            <div
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
              style={imageStyle}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
            </div>
            <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-[10px] font-semibold text-paper backdrop-blur">
                <CategoryIcon slug={listing.category.slug} size={11} />
                {listing.category.name}
              </span>
              <span className="rounded-full bg-white/95 px-2 py-1 shadow-sm backdrop-blur">
                <DifficultyMeter difficulty={listing.difficulty} showLabel={false} />
              </span>
            </div>
            {photos > 1 ? (
              <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold text-paper backdrop-blur">
                <Images size={11} />
                {photos} photos
              </span>
            ) : null}
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-mist">
              <MapPin size={11} />
              {listing.place.city}, {listing.place.district}
            </p>

            <h3 className="line-clamp-2 font-display text-base font-bold leading-snug tracking-tight">
              {listing.title}
            </h3>

            <ul className="space-y-1.5 text-xs text-[#54635A]">
              <li className="flex items-center gap-2">
                <Clock size={12} className="shrink-0 text-mist" />
                {listing.durationHours}h
              </li>
              <li className="flex items-center gap-2">
                <Users size={12} className="shrink-0 text-mist" />
                {listing.minGroupSize}–{listing.maxGroupSize} people
              </li>
              <li className="flex items-center gap-2 text-mist">
                <BadgeCheck size={12} className="shrink-0 text-forest" />
                <span className="truncate">{listing.operator.businessName}</span>
              </li>
            </ul>

            <div className="flex items-end justify-between border-t border-line/70 pt-3">
              <div className="text-sm">
                <span className="text-[11px] text-mist">from </span>
                <span className="font-display text-lg font-bold tracking-tight">
                  {formatInr(listing.basePrice)}
                </span>
                <span className="text-[11px] text-mist"> /person</span>
              </div>
              <StarRating rating={listing.ratingAvg} count={listing.ratingCount} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
