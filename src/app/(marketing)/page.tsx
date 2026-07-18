import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { WhyBhramanSection } from "@/components/home/why-bhraman";
import {
  KnowTheRoomSection,
  TrustFaqSection,
} from "@/components/home/trust-sections";
import { HowItWorksSection, AiPlannerBand } from "@/components/home/how-and-ai";
import { MaharashtraMapSection } from "@/components/home/maharashtra-map";
import {
  ProofStrip,
  OperatorSpotlight,
} from "@/components/home/proof-and-operators";
import { WeekendStorySection } from "@/components/home/weekend-story";
import { AiConciergeDock } from "@/components/home/ai-concierge-dock";
import { CategoryExploreSection } from "@/components/home/category-explore";
import { TrendingCarousel } from "@/components/home/trending-carousel";
import { CategoryIcon } from "@/components/ui/category-icon";
import { HOME_CATEGORIES } from "@/lib/ui-present";
import {
  buildCategoryExploreRows,
  dedupeListingsById,
} from "@/lib/home-listings";
import {
  getAdventureMapPins,
  getListingCards,
  getPublicOperators,
} from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  const [page1, page2, operators, pins] = await Promise.all([
    getListingCards({ page: 1 }),
    getListingCards({ page: 2 }),
    getPublicOperators(),
    getAdventureMapPins(),
  ]);

  const listings = dedupeListingsById([
    ...page1.listings,
    ...page2.listings,
  ]);
  const featured = listings.slice(0, 5);
  const categoryRows = buildCategoryExploreRows(listings);

  return (
    <main className="overflow-x-clip">
      <Navbar onDark />
      <Hero />

      <section className="page-shell relative z-20 -mt-14 sm:-mt-16">
        <div className="flex justify-between gap-2 overflow-x-auto rounded-[var(--radius-card)] border border-line/80 bg-white p-3 shadow-[var(--shadow-md)] scrollbar-hide sm:gap-1 sm:p-4 sm:justify-evenly">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/discover?category=${c.slug}`}
              className="flex min-w-[72px] shrink-0 flex-col items-center gap-2 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-paper-2 sm:min-w-0 sm:flex-1"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 text-forest">
                <CategoryIcon slug={c.slug} size={19} />
              </span>
              <span className="whitespace-nowrap text-[11px] font-medium text-ink">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <TrendingCarousel listings={featured} />
      <MaharashtraMapSection pins={pins} />
      <CategoryExploreSection rows={categoryRows} />
      <ProofStrip listings={listings} operators={operators} />
      <WhyBhramanSection />
      <WeekendStorySection />
      <KnowTheRoomSection />
      <OperatorSpotlight operators={operators} />
      <HowItWorksSection />
      <TrustFaqSection />
      <AiPlannerBand />
      <Footer />
      <AiConciergeDock />
    </main>
  );
}
