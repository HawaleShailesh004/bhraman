import { Suspense } from "react";
import { DiscoverClient } from "@/components/discovery/discover-client";
import { parseListingFilters } from "@/lib/filters";
import { listPlacesWithMultipleOperators } from "@/lib/compare";
import { getAllDiscoverListings, getCategories } from "@/lib/listings";

export const dynamic = "force-dynamic";

type DiscoverPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  parseListingFilters(searchParams);
  const [listings, categories, comparePlaces] = await Promise.all([
    getAllDiscoverListings(),
    getCategories(),
    listPlacesWithMultipleOperators(8),
  ]);

  const initialCategory =
    typeof searchParams.category === "string" ? searchParams.category : "all";
  const initialQuery =
    typeof searchParams.q === "string" ? searchParams.q : "";
  const initialCity =
    typeof searchParams.city === "string" ? searchParams.city : "";

  return (
    <main className="min-h-screen bg-paper">
      <Suspense fallback={<div className="pt-28 px-6">Loading discover…</div>}>
        <DiscoverClient
          listings={listings}
          categories={categories}
          comparePlaces={comparePlaces}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
          initialCity={initialCity}
        />
      </Suspense>
    </main>
  );
}
