import type { ListingCardData } from "@/types/listing";
import { CATEGORY_COVERS, HOME_CATEGORIES } from "@/lib/ui-present";

export type CategoryExploreRow = {
  slug: string;
  name: string;
  listings: ListingCardData[];
};

export type CategoryDockItem = {
  slug: string;
  name: string;
  coverUrl: string;
  count: number;
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

export type CategoryCoverSource = {
  categorySlug: string;
  heroImageUrl: string | null;
};

/**
 * Category dock tiles: prefer a real listing hero from the DB,
 * else a Maharashtra place photo fallback.
 */
export function buildCategoryDockItems(
  sources: CategoryCoverSource[],
): CategoryDockItem[] {
  return HOME_CATEGORIES.map((cat) => {
    const inCat = sources.filter((l) => l.categorySlug === cat.slug);
    const withPhoto = inCat.find((l) => Boolean(l.heroImageUrl?.trim()));
    return {
      slug: cat.slug,
      name: cat.name,
      coverUrl:
        withPhoto?.heroImageUrl?.trim() ||
        CATEGORY_COVERS[cat.slug] ||
        CATEGORY_COVERS.trekking,
      count: inCat.length,
    };
  });
}
