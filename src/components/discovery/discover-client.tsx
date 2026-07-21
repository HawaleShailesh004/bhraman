"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { ListingCardData } from "@/types/listing";
import { ListingCardUi } from "@/components/discovery/listing-card-ui";
import {
  FilterChips,
  FilterSortBar,
  SearchBarUi,
} from "@/components/discovery/search-filters-ui";
import {
  ComparePlacesStrip,
  type ComparePlaceRow,
} from "@/components/compare/compare-places-strip";
import { Button } from "@/components/ui/primitives";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";
import { matchesListingCity, matchesListingQuery } from "@/lib/listing-search";

type SortOption = "recommended" | "price-low" | "price-high";

export function DiscoverClient({
  listings,
  categories,
  comparePlaces,
  initialCategory = "all",
  initialQuery = "",
  initialCity = "",
}: {
  listings: ListingCardData[];
  categories: { slug: string; name: string; icon: string | null }[];
  comparePlaces: ComparePlaceRow[];
  initialCategory?: string;
  initialQuery?: string;
  initialCity?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "recommended",
  );

  const query = searchParams.get("q") ?? initialQuery;
  const cityFilter = searchParams.get("city") ?? initialCity;

  const comparePlaceSlugs = useMemo(
    () => new Set(comparePlaces.map((p) => p.placeSlug)),
    [comparePlaces],
  );

  const operatorCountByPlace = useMemo(() => {
    const map = new Map<string, number>();
    for (const place of comparePlaces) {
      map.set(place.placeSlug, place.operatorCount);
    }
    return map;
  }, [comparePlaces]);

  const results = useMemo(() => {
    let r = listings.filter(
      (l) => category === "all" || l.category.slug === category,
    );
    r = r.filter(
      (l) => matchesListingQuery(l, query) && matchesListingCity(l, cityFilter),
    );
    if (sort === "price-low")
      r = [...r].sort((a, b) => a.basePrice - b.basePrice);
    if (sort === "price-high")
      r = [...r].sort((a, b) => b.basePrice - a.basePrice);
    if (sort === "recommended")
      r = [...r].sort((a, b) => b.ratingAvg - a.ratingAvg);
    return r;
  }, [listings, category, sort, query, cityFilter]);

  const pagination = useClientPagination(
    results,
    10,
    `${category}-${sort}-${query}-${cityFilter}`,
  );

  function onCategoryChange(slug: string) {
    setCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug && slug !== "all") params.set("category", slug);
    else params.delete("category");
    router.replace(`/discover?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="page-shell pt-28 pb-24">
      <div className="mb-12 max-w-2xl">
        <h1 className="mb-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">
          Discover adventures
        </h1>
        <p className="text-base leading-relaxed text-mist">
          Find your next weekend across Maharashtra - {listings.length} live
          experiences from verified operators.
        </p>
      </div>

      <div className="mb-8">
        <SearchBarUi />
      </div>

      <ComparePlacesStrip places={comparePlaces} />

      <div className="mb-8">
        <FilterChips
          categories={categories}
          active={category}
          onChange={onCategoryChange}
        />
      </div>
      <div className="mb-10">
        <FilterSortBar count={results.length} sort={sort} onSort={setSort} />
      </div>

      {results.length === 0 ? (
        <div className="mx-auto max-w-md rounded-[var(--radius-card)] border border-dashed border-line bg-white p-14 text-center">
          <Compass className="mx-auto mb-4 text-mist" size={32} />
          <h3 className="mb-2 font-display text-lg font-bold">
            No adventures match yet
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-mist">
            {query
              ? `Nothing matched "${query}". Try Kolad, Kalsubai, or rafting.`
              : "Try a different category - or let the AI planner suggest something."}
          </p>
          <Button href="/plan">Plan with AI</Button>
        </div>
      ) : (
        <div className="space-y-8">
          <motion.div
            layout
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {pagination.pageItems.map((l, i) => {
                const placeSlug = l.place.slug;
                const operatorCount =
                  placeSlug && comparePlaceSlugs.has(placeSlug)
                    ? operatorCountByPlace.get(placeSlug)
                    : undefined;
                return (
                  <motion.div
                    key={l.id}
                    layout
                    className="h-full"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListingCardUi
                      listing={l}
                      index={i}
                      compareOperatorCount={operatorCount}
                      comparePlaceSlug={placeSlug}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          <PaginationControls
            total={pagination.total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalPages={pagination.totalPages}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
          />
        </div>
      )}
    </div>
  );
}
