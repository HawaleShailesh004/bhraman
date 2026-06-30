import { Suspense } from "react";
import { DiscoverClient } from "@/components/discovery/discover-client";
import { parseListingFilters } from "@/lib/filters";
import { getCategories, getListingCards } from "@/lib/listings";

export const dynamic = "force-dynamic";

type DiscoverPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const filters = parseListingFilters(searchParams);
  const [{ listings }, categories] = await Promise.all([
    getListingCards(filters),
    getCategories(),
  ]);

  const initialCategory =
    typeof searchParams.category === "string" ? searchParams.category : "all";

  return (
    <main className="min-h-screen bg-paper">
      <Suspense fallback={<div className="pt-28 px-6">Loading discover…</div>}>
        <DiscoverClient
          listings={listings}
          categories={categories}
          initialCategory={initialCategory}
        />
      </Suspense>
    </main>
  );
}
