import type { Difficulty } from "@prisma/client";

export type ListingFilters = {
  categories?: string[];
  difficulty?: Difficulty[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  maxDurationHours?: number;
  sort?: "price" | "rating";
  page?: number;
};

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  basePrice: number;
  difficulty: Difficulty;
  durationHours: number;
  minGroupSize: number;
  maxGroupSize: number;
  heroImageUrl: string | null;
  category: {
    slug: string;
    name: string;
    icon: string | null;
  };
  place: {
    name: string;
    city: string;
    district: string;
  };
  operator: {
    businessName: string;
    isVerified: boolean;
    ratingAvg: number;
    ratingCount: number;
    completedTrips: number;
    avgResponseMins: number;
  };
  ratingAvg: number;
  ratingCount: number;
};

export type ItineraryStepData = {
  order: number;
  timeLabel: string | null;
  title: string;
  description: string | null;
};

export type ReviewData = {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: { name: string };
};

export type AvailabilitySlotData = {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSeats: number;
  seatsLeft: number;
  status: "OPEN" | "FULL" | "CLOSED";
  priceOverride?: number | null;
};

export type ListingDetailData = ListingCardData & {
  description: string;
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  meetingPoint: string | null;
  galleryUrls: string[];
  cancellationPolicy: {
    weatherRefundPct: number;
    cutoffHours: number;
    beforeCutoffPct: number;
    afterCutoffPct: number;
    noShowPct: number;
  };
  place: ListingCardData["place"] & {
    slug: string;
    latitude: number;
    longitude: number;
    elevationM: number | null;
    description: string;
  };
  operator: ListingCardData["operator"] & {
    baseCity: string;
    bio: string;
  };
  itinerary: ItineraryStepData[];
  reviews: ReviewData[];
};
