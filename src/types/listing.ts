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
  galleryUrls?: string[];
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
    slug: string;
    businessName: string;
    isVerified: boolean;
    verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
    yearsOperating: number | null;
    insuranceStatus: boolean;
    insuranceProvider: string | null;
    femaleGuideCount: number;
    totalGuideCount: number;
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
  confirmedSeats: number;
  seatsLeft: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  minSeatsToConfirm: number | null;
  status:
    | "OPEN"
    | "FILLING_FAST"
    | "CONFIRMED"
    | "FULL"
    | "CANCELLED"
    | "COMPLETED";
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

export type PublicOperatorProfileData = {
  slug: string;
  businessName: string;
  baseCity: string;
  bio: string;
  yearsOperating: number | null;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  insuranceStatus: boolean;
  insuranceProvider: string | null;
  femaleGuideCount: number;
  totalGuideCount: number;
  completedTrips: number;
  ratingAvg: number;
  ratingCount: number;
  galleryUrls: string[];
  listings: ListingCardData[];
};

export type OperatorDirectoryCardData = {
  slug: string;
  businessName: string;
  baseCity: string;
  bio: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  yearsOperating: number | null;
  insuranceStatus: boolean;
  femaleGuideCount: number;
  totalGuideCount: number;
  coverImageUrl: string | null;
  activeListingCount: number;
};

export type AdventureMapPin = {
  placeSlug: string;
  placeName: string;
  district: string;
  latitude: number;
  longitude: number;
  listingCount: number;
  sampleSlug: string;
  sampleTitle: string;
  categorySlug: string;
};
