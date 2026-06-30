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
import { Button } from "@/components/ui/primitives";

type SortOption = "recommended" | "price-low" | "price-high";

export function DiscoverClient({
  listings,
  categories,
  initialCategory = "all",
}: {
  listings: ListingCardData[];
  categories: { slug: string; name: string; icon: string | null }[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "recommended",
  );

  const results = useMemo(() => {
    let r = listings.filter(
      (l) => category === "all" || l.category.slug === category,
    );
    if (sort === "price-low")
      r = [...r].sort((a, b) => a.basePrice - b.basePrice);
    if (sort === "price-high")
      r = [...r].sort((a, b) => b.basePrice - a.basePrice);
    if (sort === "recommended")
      r = [...r].sort((a, b) => b.ratingAvg - a.ratingAvg);
    return r;
  }, [listings, category, sort]);

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
            Try a different category - or let the AI planner suggest something.
          </p>
          <Button href="/plan">Plan with AI</Button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {results.map((l, i) => (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <ListingCardUi listing={l} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
