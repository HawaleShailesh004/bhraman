"use client";

import type { ListingCardData } from "@/types/listing";
import { ListingCardUi } from "@/components/discovery/listing-card-ui";
import { FloatingCarouselRail } from "@/components/ui/floating-carousel-rail";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/motion/scroll-reveal";
import { COPY } from "@/lib/marketing-copy";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

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
    <section className="section-y bg-paper">
      <Reveal kind="up" className="page-shell min-w-0">
        <SectionHeader
          eyebrow={COPY.trending.eyebrow}
          title={COPY.trending.title}
          href="/discover"
          linkLabel="View all"
        />
      </Reveal>

      <Reveal kind="up" delay={0.08}>
        <FloatingCarouselRail
          scrollRef={ref}
          canLeft={canLeft}
          canRight={canRight}
          onScroll={scrollByDir}
        >
          {listings.map((listing, i) => (
            <div
              key={listing.id}
              className="w-[min(calc(100vw-2.5rem),336px)] shrink-0 snap-start"
            >
              <ListingCardUi listing={listing} index={i} />
            </div>
          ))}
        </FloatingCarouselRail>
      </Reveal>
    </section>
  );
}
