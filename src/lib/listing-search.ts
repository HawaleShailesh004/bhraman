import type { ListingCardData } from "@/types/listing";

/** Client-side text match for discover search. */
export function matchesListingQuery(
  listing: ListingCardData,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    listing.title,
    listing.summary,
    listing.place.name,
    listing.place.city,
    listing.place.district,
    listing.category.name,
    listing.operator.businessName,
  ]
    .join(" ")
    .toLowerCase();

  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function matchesListingCity(
  listing: ListingCardData,
  city: string | undefined,
): boolean {
  if (!city || city === "All Maharashtra") return true;
  const needle = city.trim().toLowerCase();
  const haystack =
    `${listing.place.city} ${listing.place.district} ${listing.place.name}`.toLowerCase();
  return haystack.includes(needle);
}
