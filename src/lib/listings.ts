import "server-only";

import type { Difficulty, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getCatalogAllListings,
  getCatalogCategories,
  getCatalogListingBySlug,
  getCatalogListings,
} from "@/lib/seed-catalog";
import type {
  ListingCardData,
  ListingDetailData,
  ListingFilters,
  OperatorDirectoryCardData,
  PublicOperatorProfileData,
} from "@/types/listing";

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  basePrice: true,
  difficulty: true,
  durationHours: true,
  minGroupSize: true,
  maxGroupSize: true,
  heroImageUrl: true,
  galleryUrls: true,
  category: { select: { slug: true, name: true, icon: true } },
  place: { select: { name: true, city: true, district: true } },
  operator: {
    select: {
      slug: true,
      businessName: true,
      verificationStatus: true,
      yearsOperating: true,
      insuranceStatus: true,
      insuranceProvider: true,
      femaleGuideCount: true,
      totalGuideCount: true,
      ratingAvg: true,
      ratingCount: true,
      completedTrips: true,
      avgResponseMins: true,
    },
  },
} satisfies Prisma.ListingSelect;

function buildWhere(filters: ListingFilters): Prisma.ListingWhereInput {
  const date = filters.date ? new Date(filters.date) : undefined;

  return {
    status: "PUBLISHED",
    ...(filters.categories?.length && {
      category: { slug: { in: filters.categories } },
    }),
    ...(filters.difficulty?.length && {
      difficulty: { in: filters.difficulty as Difficulty[] },
    }),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          basePrice: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.maxDurationHours !== undefined && {
      durationHours: { lte: filters.maxDurationHours },
    }),
    ...(filters.city && {
      place: { city: { contains: filters.city, mode: "insensitive" as const } },
    }),
    ...(date && {
      slots: {
        some: {
          startTime: { gte: date },
          status: { in: ["OPEN", "FILLING_FAST", "CONFIRMED"] },
        },
      },
    }),
  };
}

function mapCard(
  listing: Prisma.ListingGetPayload<{ select: typeof cardSelect }>
): ListingCardData {
  const { operator, ...card } = listing;
  return {
    ...card,
    operator: {
      slug: operator.slug,
      businessName: operator.businessName,
      isVerified: operator.verificationStatus === "VERIFIED",
      verificationStatus: operator.verificationStatus,
      yearsOperating: operator.yearsOperating,
      insuranceStatus: operator.insuranceStatus,
      insuranceProvider: operator.insuranceProvider,
      femaleGuideCount: operator.femaleGuideCount,
      totalGuideCount: operator.totalGuideCount,
      ratingAvg: operator.ratingAvg,
      ratingCount: operator.ratingCount,
      completedTrips: operator.completedTrips,
      avgResponseMins: operator.avgResponseMins,
    },
    ratingAvg: operator.ratingAvg,
    ratingCount: operator.ratingCount,
  };
}

async function dbHasPublishedListings() {
  try {
    const count = await prisma.listing.count({ where: { status: "PUBLISHED" } });
    return count > 0;
  } catch {
    return false;
  }
}

async function withCatalogFallback<T>(
  query: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    return await query();
  } catch {
    return fallback();
  }
}

export async function getListingCards(filters: ListingFilters = {}) {
  return withCatalogFallback(async () => {
    if (!(await dbHasPublishedListings())) {
      return getCatalogListings(filters);
    }

    const page = filters.page ?? 1;
    const pageSize = 24;
    const where = buildWhere(filters);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: cardSelect,
        orderBy:
          filters.sort === "price"
            ? { basePrice: "asc" }
            : { operator: { ratingAvg: "desc" } },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings: listings.map(mapCard),
      total,
      page,
      pageSize,
    };
  }, () => getCatalogListings(filters));
}

export async function getListingDetail(slug: string): Promise<ListingDetailData | null> {
  return withCatalogFallback(async () => {
    if (!(await dbHasPublishedListings())) {
      return getCatalogListingBySlug(slug);
    }

    const listing = await prisma.listing.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { slug: true, name: true, icon: true } },
      place: true,
      operator: true,
      itinerary: { orderBy: { order: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          booking: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!listing) return null;

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    summary: listing.summary,
    description: listing.description,
    basePrice: listing.basePrice,
    difficulty: listing.difficulty,
    durationHours: listing.durationHours,
    minGroupSize: listing.minGroupSize,
    maxGroupSize: listing.maxGroupSize,
    heroImageUrl: listing.heroImageUrl,
    galleryUrls: listing.galleryUrls,
    inclusions: listing.inclusions,
    exclusions: listing.exclusions,
    thingsToCarry: listing.thingsToCarry,
    meetingPoint: listing.meetingPoint,
    cancellationPolicy: listing.cancellationPolicy as ListingDetailData["cancellationPolicy"],
    category: listing.category,
    place: {
      slug: listing.place.slug,
      name: listing.place.name,
      city: listing.place.city,
      district: listing.place.district,
      latitude: listing.place.latitude,
      longitude: listing.place.longitude,
      elevationM: listing.place.elevationM,
      description: listing.place.description,
    },
    operator: {
      slug: listing.operator.slug,
      businessName: listing.operator.businessName,
      baseCity: listing.operator.baseCity,
      bio: listing.operator.bio,
      isVerified: listing.operator.verificationStatus === "VERIFIED",
      verificationStatus: listing.operator.verificationStatus,
      yearsOperating: listing.operator.yearsOperating,
      insuranceStatus: listing.operator.insuranceStatus,
      insuranceProvider: listing.operator.insuranceProvider,
      femaleGuideCount: listing.operator.femaleGuideCount,
      totalGuideCount: listing.operator.totalGuideCount,
      ratingAvg: listing.operator.ratingAvg,
      ratingCount: listing.operator.ratingCount,
      completedTrips: listing.operator.completedTrips,
      avgResponseMins: listing.operator.avgResponseMins,
    },
    ratingAvg: listing.operator.ratingAvg,
    ratingCount: listing.operator.ratingCount,
    itinerary: listing.itinerary.map((step) => ({
      order: step.order,
      timeLabel: step.timeLabel,
      title: step.title,
      description: step.description,
    })),
    reviews: listing.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isVerified: true,
      createdAt: review.createdAt.toISOString(),
      user: { name: review.booking.user.name },
    })),
  };
  }, () => getCatalogListingBySlug(slug));
}

export async function getPublicOperatorProfile(
  slug: string,
): Promise<PublicOperatorProfileData | null> {
  const fallback = () => {
    const listings = getCatalogAllListings().filter(
      (listing) => listing.operator.slug === slug,
    );
    if (listings.length === 0) return null;
    const operator = listings[0].operator;
    return {
      slug: operator.slug,
      businessName: operator.businessName,
      baseCity: operator.baseCity,
      bio: operator.bio,
      yearsOperating: operator.yearsOperating,
      verificationStatus: operator.verificationStatus,
      insuranceStatus: operator.insuranceStatus,
      insuranceProvider: operator.insuranceProvider,
      femaleGuideCount: operator.femaleGuideCount,
      totalGuideCount: operator.totalGuideCount,
      completedTrips: operator.completedTrips,
      ratingAvg: operator.ratingAvg,
      ratingCount: operator.ratingCount,
      galleryUrls: Array.from(
        new Set(
          listings.flatMap((listing) => [
            listing.heroImageUrl,
            ...(listing.galleryUrls ?? []),
          ]),
        ),
      ).filter((url): url is string => Boolean(url)),
      listings,
    };
  };

  return withCatalogFallback(async () => {
    if (!(await dbHasPublishedListings())) return fallback();

    const operator = await prisma.operator.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        businessName: true,
        baseCity: true,
        bio: true,
        yearsOperating: true,
        verificationStatus: true,
        insuranceStatus: true,
        insuranceProvider: true,
        femaleGuideCount: true,
        totalGuideCount: true,
        listings: {
          where: { status: "PUBLISHED" },
          select: cardSelect,
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    if (!operator) return null;

    const [reviewAggregate, completedTrips] = await Promise.all([
      prisma.review.aggregate({
        where: { listing: { operatorId: operator.id } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.availabilitySlot.count({
        where: {
          status: "COMPLETED",
          listing: { operatorId: operator.id },
        },
      }),
    ]);

    const listings = operator.listings.map(mapCard);
    const galleryUrls = Array.from(
      new Set(
        listings.flatMap((listing) => [
          listing.heroImageUrl,
          ...(listing.galleryUrls ?? []),
        ]),
      ),
    ).filter((url): url is string => Boolean(url));

    return {
      slug: operator.slug,
      businessName: operator.businessName,
      baseCity: operator.baseCity,
      bio: operator.bio,
      yearsOperating: operator.yearsOperating,
      verificationStatus: operator.verificationStatus,
      insuranceStatus: operator.insuranceStatus,
      insuranceProvider: operator.insuranceProvider,
      femaleGuideCount: operator.femaleGuideCount,
      totalGuideCount: operator.totalGuideCount,
      completedTrips,
      ratingAvg: reviewAggregate._avg.rating ?? 0,
      ratingCount: reviewAggregate._count.rating,
      galleryUrls,
      listings,
    };
  }, fallback);
}

export async function getPublicOperators(): Promise<
  OperatorDirectoryCardData[]
> {
  const fallback = () => {
    const bySlug = new Map<string, OperatorDirectoryCardData>();
    for (const listing of getCatalogAllListings()) {
      const existing = bySlug.get(listing.operator.slug);
      if (existing) {
        existing.activeListingCount += 1;
        continue;
      }
      bySlug.set(listing.operator.slug, {
        slug: listing.operator.slug,
        businessName: listing.operator.businessName,
        baseCity: listing.operator.baseCity,
        bio: listing.operator.bio,
        verificationStatus: listing.operator.verificationStatus,
        yearsOperating: listing.operator.yearsOperating,
        insuranceStatus: listing.operator.insuranceStatus,
        femaleGuideCount: listing.operator.femaleGuideCount,
        totalGuideCount: listing.operator.totalGuideCount,
        coverImageUrl: listing.heroImageUrl,
        activeListingCount: 1,
      });
    }
    return Array.from(bySlug.values()).sort((a, b) =>
      a.businessName.localeCompare(b.businessName),
    );
  };

  return withCatalogFallback(async () => {
    if (!(await dbHasPublishedListings())) return fallback();
    const operators = await prisma.operator.findMany({
      where: { listings: { some: { status: "PUBLISHED" } } },
      select: {
        slug: true,
        businessName: true,
        baseCity: true,
        bio: true,
        verificationStatus: true,
        yearsOperating: true,
        insuranceStatus: true,
        femaleGuideCount: true,
        totalGuideCount: true,
        listings: {
          where: { status: "PUBLISHED" },
          select: { heroImageUrl: true },
          orderBy: { updatedAt: "desc" },
        },
        _count: {
          select: { listings: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: { businessName: "asc" },
    });

    return operators.map((operator) => ({
      slug: operator.slug,
      businessName: operator.businessName,
      baseCity: operator.baseCity,
      bio: operator.bio,
      verificationStatus: operator.verificationStatus,
      yearsOperating: operator.yearsOperating,
      insuranceStatus: operator.insuranceStatus,
      femaleGuideCount: operator.femaleGuideCount,
      totalGuideCount: operator.totalGuideCount,
      coverImageUrl:
        operator.listings.find((listing) => listing.heroImageUrl)
          ?.heroImageUrl ?? null,
      activeListingCount: operator._count.listings,
    }));
  }, fallback);
}

export async function getCategories() {
  return withCatalogFallback(async () => {
    if (!(await dbHasPublishedListings())) {
      return getCatalogCategories();
    }

    return prisma.category.findMany({
      select: { slug: true, name: true, icon: true },
      orderBy: { name: "asc" },
    });
  }, () => getCatalogCategories());
}

export async function searchPlannerListings(filters: ListingFilters) {
  return withCatalogFallback(async () => {
    if (!(await dbHasPublishedListings())) {
      return getCatalogAllListings()
      .filter((listing) => {
        if (filters.categories?.length && !filters.categories.includes(listing.category.slug)) {
          return false;
        }
        if (filters.difficulty?.length && !filters.difficulty.includes(listing.difficulty)) {
          return false;
        }
        if (
          filters.maxPrice !== undefined &&
          listing.basePrice > filters.maxPrice
        ) {
          return false;
        }
        if (
          filters.maxDurationHours !== undefined &&
          listing.durationHours > filters.maxDurationHours
        ) {
          return false;
        }
        if (filters.city) {
          const haystack =
            `${listing.place.city} ${listing.place.district} ${listing.place.name}`.toLowerCase();
          if (!haystack.includes(filters.city.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => b.ratingAvg - a.ratingAvg)
      .slice(0, 6);
    }

    const rows = await prisma.listing.findMany({
      where: buildWhere(filters),
      select: cardSelect,
      orderBy: { operator: { ratingAvg: "desc" } },
      take: 6,
    });

    return rows.map(mapCard);
  }, () =>
    getCatalogAllListings()
      .filter((listing) => {
        if (filters.categories?.length && !filters.categories.includes(listing.category.slug)) {
          return false;
        }
        if (filters.difficulty?.length && !filters.difficulty.includes(listing.difficulty)) {
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
        if (filters.city) {
          const haystack =
            `${listing.place.city} ${listing.place.district} ${listing.place.name}`.toLowerCase();
          if (!haystack.includes(filters.city.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => b.ratingAvg - a.ratingAvg)
      .slice(0, 6)
  );
}
