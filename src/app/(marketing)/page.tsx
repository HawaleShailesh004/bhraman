import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { CategoryDock } from "@/components/home/category-dock";
import { WhyBhramanSection } from "@/components/home/why-bhraman";
import { TrustFaqSection } from "@/components/home/trust-sections";
import { MaharashtraMapSection } from "@/components/home/maharashtra-map";
import {
  ProofStrip,
  OperatorSpotlight,
} from "@/components/home/proof-and-operators";
import { LiveTicker } from "@/components/home/live-ticker";
import { HowItWorksSticky } from "@/components/home/how-it-works-sticky";
import { CompareSlider } from "@/components/home/compare-slider";
import {
  WhatWeBelieveQuote,
  WhyWeBuiltQuote,
} from "@/components/home/quote-moments";
import { PlannerOrb } from "@/components/home/planner-orb";
import { AiConciergeDock } from "@/components/home/ai-concierge-dock";
import { TrendingCarousel } from "@/components/home/trending-carousel";
import { Reveal } from "@/components/motion/scroll-reveal";
import {
  buildCategoryDockItems,
  dedupeListingsById,
} from "@/lib/home-listings";
import {
  getAdventureMapPins,
  getCategoryCoverSources,
  getListingCards,
  getPublicOperators,
} from "@/lib/listings";

export const dynamic = "force-dynamic";

/**
 * Landing arc: Hook → Understand → Trust → Explore → Convert
 * Order from bhraman_landing_order_animations.md
 */
export default async function MarketingHomePage() {
  const [page1, page2, operators, pins, coverSources] = await Promise.all([
    getListingCards({ page: 1 }),
    getListingCards({ page: 2 }),
    getPublicOperators(),
    getAdventureMapPins(),
    getCategoryCoverSources(),
  ]);

  const listings = dedupeListingsById([
    ...page1.listings,
    ...page2.listings,
  ]);
  const featured = listings.slice(0, 5);
  const categoryItems = buildCategoryDockItems(coverSources);

  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar onDark />
      <Hero />
      <CategoryDock items={categoryItems} />
      <TrendingCarousel listings={featured} />
      <WhyWeBuiltQuote />
      <WhyBhramanSection />
      <HowItWorksSticky />
      <Reveal kind="up">
        <CompareSlider />
      </Reveal>
      <Reveal kind="in">
        <MaharashtraMapSection pins={pins} />
      </Reveal>
      <ProofStrip listings={listings} operators={operators} />
      <Reveal kind="up">
        <OperatorSpotlight operators={operators} />
      </Reveal>
      <WhatWeBelieveQuote />
      <Reveal kind="up">
        <TrustFaqSection />
      </Reveal>
      <PlannerOrb />
      <LiveTicker />
      <Reveal kind="up">
        <Footer />
      </Reveal>
      <AiConciergeDock />
    </main>
  );
}
