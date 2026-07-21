"use client";

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";

export type ComparePlaceRow = {
  placeSlug: string;
  placeName: string;
  city: string;
  district: string;
  operatorCount: number;
};

export function ComparePlacesStrip({
  places,
}: {
  places: ComparePlaceRow[];
}) {
  if (places.length === 0) return null;

  return (
    <section className="mb-8 rounded-[18px] border border-forest/15 bg-[#EAF1EC]/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <GitCompareArrows size={16} className="text-forest" />
        <h2 className="font-display text-base font-bold tracking-tight text-ink">
          Same place, different operators
        </h2>
      </div>
      <p className="mb-3 text-sm text-body-muted">
        Compare price, safety scores, and batch mix side by side — then book the
        operator you prefer.
      </p>
      <div className="flex flex-wrap gap-2">
        {places.map((place) => (
          <Link
            key={place.placeSlug}
            href={`/compare/${place.placeSlug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/25 bg-white px-3.5 py-2 text-xs font-semibold text-forest transition-colors hover:border-forest hover:bg-white/90"
          >
            {place.placeName}
            <span className="rounded-full bg-forest/10 px-1.5 py-0.5 text-[10px] font-bold">
              {place.operatorCount} ops
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
