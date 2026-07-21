import "server-only";

import { prisma } from "@/lib/prisma";
import { formatGenderMix } from "@/lib/gender-mix";
import type { CancellationPolicy } from "@/lib/refunds";
import type {
  ItineraryStepData,
  ListingCardData,
  ReviewData,
} from "@/types/listing";

export type CompareListingRow = ListingCardData & {
  description: string;
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  meetingPoint: string | null;
  cancellationPolicy: CancellationPolicy;
  itinerary: ItineraryStepData[];
  reviews: ReviewData[];
  nextDeparture: string | null;
  womenPctLabel: string;
  cancellationLabel: string;
  operator: ListingCardData["operator"] & {
    baseCity: string;
    bio: string;
  };
};

export type PlaceCompareBundle = {
  place: {
    slug: string;
    name: string;
    city: string;
    district: string;
  };
  operatorCount: number;
  listings: CompareListingRow[];
};

function cancellationLabel(policy: CancellationPolicy) {
  return `Free before ${policy.cutoffHours}h · ${policy.beforeCutoffPct}% / ${policy.afterCutoffPct}% after`;
}

function mapListingRow(
  listing: Awaited<ReturnType<typeof fetchPlaceListings>>[number],
): CompareListingRow {
  const slot = listing.slots[0];
  const mix = slot
    ? formatGenderMix({
        female: slot.femaleCount,
        male: slot.maleCount,
        other: slot.otherCount,
        booked: slot.bookedSeats,
      })
    : { label: "-" };

  const { operator } = listing;
  const policy = listing.cancellationPolicy as CancellationPolicy;

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
    cancellationPolicy: policy,
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
    category: listing.category,
    place: listing.place,
    operator: {
      slug: operator.slug,
      businessName: operator.businessName,
      baseCity: operator.baseCity,
      bio: operator.bio,
      isVerified: operator.verificationStatus === "VERIFIED",
      verificationStatus: operator.verificationStatus,
      logoUrl: operator.logoUrl,
      yearsOperating: operator.yearsOperating,
      insuranceStatus: operator.insuranceStatus,
      insuranceProvider: operator.insuranceProvider,
      femaleGuideCount: operator.femaleGuideCount,
      totalGuideCount: operator.totalGuideCount,
      ratingAvg: operator.ratingAvg,
      ratingCount: operator.ratingCount,
      completedTrips: operator.completedTrips,
      avgResponseMins: operator.avgResponseMins,
      experienceScore: operator.experienceScore,
      safetyScore: operator.safetyScore,
    },
    ratingAvg: operator.ratingAvg,
    ratingCount: operator.ratingCount,
    nextDeparture: slot?.startTime.toISOString() ?? null,
    womenPctLabel: mix.label,
    cancellationLabel: cancellationLabel(policy),
  };
}

async function fetchPlaceListings(placeSlug: string) {
  const now = new Date();
  return prisma.listing.findMany({
    where: { status: "PUBLISHED", place: { slug: placeSlug } },
    include: {
      category: { select: { slug: true, name: true, icon: true } },
      place: { select: { slug: true, name: true, city: true, district: true } },
      itinerary: { orderBy: { order: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          booking: { include: { user: { select: { name: true } } } },
        },
      },
      operator: {
        select: {
          slug: true,
          businessName: true,
          baseCity: true,
          bio: true,
          verificationStatus: true,
          logoUrl: true,
          yearsOperating: true,
          insuranceStatus: true,
          insuranceProvider: true,
          femaleGuideCount: true,
          totalGuideCount: true,
          ratingAvg: true,
          ratingCount: true,
          completedTrips: true,
          avgResponseMins: true,
          experienceScore: true,
          safetyScore: true,
        },
      },
      slots: {
        where: {
          startTime: { gte: now },
          status: { in: ["OPEN", "FILLING_FAST", "CONFIRMED", "LIVE"] },
        },
        orderBy: { startTime: "asc" },
        take: 1,
      },
    },
    orderBy: { basePrice: "asc" },
  });
}

/** One cheapest listing per operator at a place, for side-by-side compare. */
export async function getPlaceCompareBundle(
  placeSlug: string,
): Promise<PlaceCompareBundle | null> {
  const place = await prisma.place.findUnique({ where: { slug: placeSlug } });
  if (!place) return null;

  const all = await fetchPlaceListings(placeSlug);
  const byOperator = new Map<string, (typeof all)[number]>();
  for (const listing of all) {
    if (!byOperator.has(listing.operatorId)) {
      byOperator.set(listing.operatorId, listing);
    }
  }

  const listings = Array.from(byOperator.values()).map(mapListingRow);

  return {
    place: {
      slug: place.slug,
      name: place.name,
      city: place.city,
      district: place.district,
    },
    operatorCount: listings.length,
    listings,
  };
}

export async function countOperatorsAtPlace(placeSlug: string) {
  const rows = await prisma.listing.findMany({
    where: { status: "PUBLISHED", place: { slug: placeSlug } },
    select: { operatorId: true },
    distinct: ["operatorId"],
  });
  return rows.length;
}

export async function listPlacesWithMultipleOperators(limit = 12) {
  const places = await prisma.place.findMany({
    select: {
      slug: true,
      name: true,
      city: true,
      district: true,
      listings: {
        where: { status: "PUBLISHED" },
        select: { operatorId: true },
      },
    },
  });

  return places
    .map((p) => {
      const operators = new Set(p.listings.map((l) => l.operatorId));
      return {
        placeSlug: p.slug,
        placeName: p.name,
        city: p.city,
        district: p.district,
        operatorCount: operators.size,
      };
    })
    .filter((p) => p.operatorCount >= 2)
    .sort((a, b) => b.operatorCount - a.operatorCount)
    .slice(0, limit);
}
