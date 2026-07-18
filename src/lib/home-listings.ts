import type { ListingCardData } from "@/types/listing";
import { HOME_CATEGORIES } from "@/lib/ui-present";

export type CategoryExploreRow = {
  slug: string;
  name: string;
  listings: ListingCardData[];
};

/** Deduplicate listing cards by id (e.g. after merging paginated fetches). */
export function dedupeListingsById(
  listings: ListingCardData[],
): ListingCardData[] {
  const seen = new Set<string>();
  return listings.filter((listing) => {
    if (seen.has(listing.id)) return false;
    seen.add(listing.id);
    return true;
  });
}

/** Group listings into home category rows, capped per category. */
export function buildCategoryExploreRows(
  listings: ListingCardData[],
  maxPerCategory = 5,
): CategoryExploreRow[] {
  return HOME_CATEGORIES.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    listings: listings
      .filter((l) => l.category.slug === cat.slug)
      .slice(0, maxPerCategory),
  }));
}
