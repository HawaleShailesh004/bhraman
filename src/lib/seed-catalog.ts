import type { Difficulty } from "@prisma/client";
import seedData from "../../prisma/data/seed-data.json";
import { getListingImages } from "@/lib/listing-images";
import { slugify } from "@/lib/slugify";
import type {
  ListingCardData,
  ListingDetailData,
  ListingFilters,
} from "@/types/listing";

const CATEGORY_META: Record<string, { name: string }> = {
  trekking: { name: "Trekking" },
  rafting: { name: "Water Sports & Rafting" },
  camping: { name: "Camping" },
  paragliding: { name: "Paragliding" },
  rappelling: { name: "Waterfall Rappelling" },
  caving: { name: "Caving" },
  kayaking: { name: "Kayaking & Backwater" },
  fort: { name: "Fort Exploration" },
};

const HERO_IMAGES: Record<string, string> = {
  trekking:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  rafting:
    "https://images.unsplash.com/photo-1502680390468-be75c86b636f?auto=format&fit=crop&w=1200&q=80",
  camping:
    "https://images.unsplash.com/photo-1478131143081-80f7f84b84e7?auto=format&fit=crop&w=1200&q=80",
  paragliding:
    "https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=1200&q=80",
  rappelling:
    "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80",
  caving:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  kayaking:
    "https://images.unsplash.com/photo-1544551763-77ef2d0cfcb8?auto=format&fit=crop&w=1200&q=80",
  fort:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
};

type SeedOperator = {
  businessName: string;
  baseCity: string;
  bio: string;
  yearStarted: number;
};

type SeedListing = {
  title: string;
  categorySlug: string;
  difficulty: Difficulty;
  durationHours: number;
  basePrice: number;
  minGroupSize: number;
  maxGroupSize: number;
  summary: string;
  description: string;
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  meetingPoint?: string;
  operatorName: string;
  cancellationPolicy: ListingDetailData["cancellationPolicy"];
  itinerary: {
    order: number;
    timeLabel?: string;
    title: string;
    description?: string;
  }[];
};

type SeedDestination = {
  place: {
    slug: string;
    name: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
    elevationM?: number | null;
    description: string;
  };
  listings: SeedListing[];
};

const operators = Object.fromEntries(
  (seedData.operators as SeedOperator[]).map((operator) => [
    operator.businessName,
    operator,
  ])
);

function operatorStats(name: string) {
  const hash = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    ratingAvg: +(4.5 + (hash % 5) * 0.08).toFixed(1),
    ratingCount: 80 + (hash % 420),
    completedTrips: 200 + (hash % 1100),
    avgResponseMins: 8 + (hash % 28),
  };
}

function buildCatalog(): ListingDetailData[] {
  const catalog: ListingDetailData[] = [];

  for (const destination of seedData.destinations as SeedDestination[]) {
    for (const listing of destination.listings) {
      const operator = operators[listing.operatorName];
      if (!operator) continue;

      const slug = slugify(listing.title);
      const category = CATEGORY_META[listing.categorySlug] ?? {
        name: listing.categorySlug,
      };
      const stats = operatorStats(operator.businessName);
      const mapped = getListingImages(slug);
      const heroImageUrl =
        mapped?.heroImageUrl ?? HERO_IMAGES[listing.categorySlug] ?? null;
      const galleryUrls =
        mapped?.galleryUrls ?? (heroImageUrl ? [heroImageUrl] : []);

      catalog.push({
        id: slug,
        slug,
        title: listing.title,
        summary: listing.summary,
        description: listing.description,
        basePrice: listing.basePrice,
        difficulty: listing.difficulty,
        durationHours: listing.durationHours,
        minGroupSize: listing.minGroupSize,
        maxGroupSize: listing.maxGroupSize,
        heroImageUrl,
        galleryUrls,
        inclusions: listing.inclusions,
        exclusions: listing.exclusions,
        thingsToCarry: listing.thingsToCarry,
        meetingPoint: listing.meetingPoint ?? null,
        cancellationPolicy: listing.cancellationPolicy,
        category: {
          slug: listing.categorySlug,
          name: category.name,
          icon: null,
        },
        place: {
          slug: destination.place.slug,
          name: destination.place.name,
          city: destination.place.city,
          district: destination.place.district,
          latitude: destination.place.latitude,
          longitude: destination.place.longitude,
          elevationM: destination.place.elevationM ?? null,
          description: destination.place.description,
        },
        operator: {
          slug: slugify(operator.businessName),
          businessName: operator.businessName,
          baseCity: operator.baseCity,
          bio: operator.bio,
          isVerified: true,
          verificationStatus: "VERIFIED",
          logoUrl: null,
          yearsOperating: Math.max(
            0,
            new Date().getFullYear() - operator.yearStarted,
          ),
          insuranceStatus: false,
          insuranceProvider: null,
          femaleGuideCount: 0,
          totalGuideCount: 0,
          ...stats,
        },
        ratingAvg: stats.ratingAvg,
        ratingCount: stats.ratingCount,
        itinerary: listing.itinerary.map((step) => ({
          order: step.order,
          timeLabel: step.timeLabel ?? null,
          title: step.title,
          description: step.description ?? null,
        })),
        reviews:
          slug === slugify("Kalsubai Night Trek to Sunrise Summit")
            ? [
                {
                  id: "review-demo",
                  rating: 5,
                  comment:
                    "Guide was punctual and safety-first the whole way. Sunrise from the summit was unreal. Booking took two minutes.",
                  isVerified: true,
                  createdAt: new Date().toISOString(),
                  user: { name: "Aditya K." },
                },
              ]
            : [],
      });
    }
  }

  return catalog;
}

const catalog = buildCatalog();

function matchesFilters(listing: ListingCardData, filters: ListingFilters) {
  if (filters.categories?.length && !filters.categories.includes(listing.category.slug)) {
    return false;
  }
  if (filters.difficulty?.length && !filters.difficulty.includes(listing.difficulty)) {
    return false;
  }
  if (filters.city) {
    const city = filters.city.toLowerCase();
    const haystack = `${listing.place.city} ${listing.place.district} ${listing.place.name}`.toLowerCase();
    if (!haystack.includes(city)) return false;
  }
  if (filters.minPrice !== undefined && listing.basePrice < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== undefined && listing.basePrice > filters.maxPrice) {
    return false;
  }
  if (
    filters.maxDurationHours !== undefined &&
    listing.durationHours > filters.maxDurationHours
  ) {
    return false;
  }
  return true;
}

export function getCatalogListings(filters: ListingFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = 24;

  const filtered = catalog
    .filter((listing) => matchesFilters(listing, filters))
    .sort((a, b) => {
      if (filters.sort === "price") {
        return a.basePrice - b.basePrice;
      }
      return b.ratingAvg - a.ratingAvg;
    });

  const start = (page - 1) * pageSize;

  return {
    listings: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

export function getCatalogListingBySlug(slug: string) {
  return catalog.find((listing) => listing.slug === slug) ?? null;
}

export function getCatalogCategories() {
  const seen = new Map<string, { slug: string; name: string; icon: string | null }>();
  for (const listing of catalog) {
    seen.set(listing.category.slug, listing.category);
  }
  return Array.from(seen.values());
}

export function getCatalogAllListings() {
  return catalog;
}
