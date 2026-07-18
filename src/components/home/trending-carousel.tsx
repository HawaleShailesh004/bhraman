"use client";

import type { ListingCardData } from "@/types/listing";
import { ListingCardUi } from "@/components/discovery/listing-card-ui";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import { SectionHeader } from "@/components/ui/section-header";
import { COPY } from "@/lib/marketing-copy";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

/** Match discover grid card width (~3 cols in page-shell) + gap-5 */
const CARD_WIDTH = 336;
const CARD_GAP = 20;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

export function TrendingCarousel({ listings }: { listings: ListingCardData[] }) {
  const { ref, canLeft, canRight, scrollByDir } = useHorizontalScroll(
    CARD_STEP,
    [listings.length],
  );

  if (!listings.length) return null;

  return (
    <section className="overflow-x-hidden bg-paper pt-16 pb-4">
      <div className="page-shell min-w-0">
        <SectionHeader
          eyebrow={COPY.trending.eyebrow}
          title={COPY.trending.title}
          href="/discover"
          linkLabel="View all"
        />

        <div className="flex min-w-0 items-center gap-3">
          <CarouselNavButton
            side="left"
            disabled={!canLeft}
            onClick={() => scrollByDir(-1)}
            className="hidden md:grid"
          />

          <div
            ref={ref}
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pt-1 scrollbar-hide"
          >
            {listings.map((listing, i) => (
              <div
                key={listing.id}
                className="w-[min(88vw,336px)] shrink-0 snap-start"
              >
                <ListingCardUi listing={listing} index={i} />
              </div>
            ))}
          </div>

          <CarouselNavButton
            side="right"
            disabled={!canRight}
            onClick={() => scrollByDir(1)}
            className="hidden md:grid"
          />
        </div>
      </div>
    </section>
  );
}
