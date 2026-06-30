import type { Difficulty } from "@prisma/client";
import type { ListingFilters } from "@/types/listing";

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingFilters(
  searchParams: Record<string, string | string[] | undefined>
): ListingFilters {
  const category = getParam(searchParams, "category");
  const difficulty = getParam(searchParams, "difficulty") as Difficulty | undefined;
  const minPrice = getParam(searchParams, "minPrice");
  const maxPrice = getParam(searchParams, "maxPrice");
  const page = getParam(searchParams, "page");
  const sort = getParam(searchParams, "sort");

  return {
    categories: category ? [category] : undefined,
    difficulty: difficulty ? [difficulty] : undefined,
    city: getParam(searchParams, "city")?.replace(/\s+region$/i, ""),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    date: getParam(searchParams, "date"),
    sort: sort === "price" ? "price" : "rating",
    page: page ? Math.max(Number(page), 1) : 1,
  };
}

export function filtersToSearchParams(filters: ListingFilters) {
  const params: Record<string, string | undefined> = {
    category: filters.categories?.[0],
    difficulty: filters.difficulty?.[0],
    city: filters.city,
    minPrice: filters.minPrice?.toString(),
    maxPrice: filters.maxPrice?.toString(),
    date: filters.date,
    sort: filters.sort,
    page: filters.page && filters.page > 1 ? String(filters.page) : undefined,
  };

  return params;
}
