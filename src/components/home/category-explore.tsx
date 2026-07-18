"use client";

import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import { SectionHeader } from "@/components/ui/section-header";
import { CategoryCoverCard } from "@/components/home/category-cover-card";
import { COPY } from "@/lib/marketing-copy";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import type { CategoryExploreRow } from "@/lib/home-listings";

export type { CategoryExploreRow };

const CARD_WIDTH = 300;
const CARD_GAP = 20;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

export function CategoryExploreSection({
  rows,
}: {
  rows: CategoryExploreRow[];
}) {
  const { ref, canLeft, canRight, scrollByDir } = useHorizontalScroll(
    CARD_STEP,
    [rows.length],
  );

  if (!rows.length) return null;

  return (
    <section className="section-y overflow-x-hidden bg-ink text-paper">
      <div className="page-shell">
        <SectionHeader
          eyebrow={COPY.explore.eyebrow}
          title={COPY.explore.title}
          href="/discover"
          linkLabel={COPY.explore.seeAll}
          tone="ink"
          className="mb-8"
          actions={
            <div className="flex items-center gap-2">
              <CarouselNavButton
                side="left"
                tone="ink"
                disabled={!canLeft}
                onClick={() => scrollByDir(-1)}
              />
              <CarouselNavButton
                side="right"
                tone="ink"
                disabled={!canRight}
                onClick={() => scrollByDir(1)}
              />
            </div>
          }
        />

        <div
          ref={ref}
          className="flex min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 scrollbar-hide"
        >
          {rows.map((row, i) => (
            <CategoryCoverCard
              key={row.slug}
              slug={row.slug}
              name={row.name}
              coverUrl={
                row.listings.find((l) => l.heroImageUrl)?.heroImageUrl ?? null
              }
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
