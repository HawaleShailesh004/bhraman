/**
 * Real place photos (Wikimedia Commons) mapped to each listing via place slug.
 */

import placeImages from "../../prisma/data/place-images.json";
import seedData from "../../prisma/data/seed-data.json";
import { slugify } from "@/lib/slugify";

export type ListingImageSet = {
  heroImageUrl: string;
  galleryUrls?: string[];
};

type PlaceImageEntry = {
  primary: string;
  gallery?: string[];
};

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    if (url && !seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  }
  return result;
}

function imagesForPlace(placeSlug: string, listingIndex: number): ListingImageSet | null {
  const place = (placeImages as Record<string, PlaceImageEntry>)[placeSlug];
  if (!place?.primary) return null;

  const pool = uniqueUrls([place.primary, ...(place.gallery ?? [])]);
  const heroImageUrl = pool[listingIndex % pool.length] ?? place.primary;

  const galleryUrls: string[] = [];
  for (let offset = 1; galleryUrls.length < 3 && offset < pool.length + 3; offset++) {
    const url = pool[(listingIndex + offset) % pool.length];
    if (url !== heroImageUrl && !galleryUrls.includes(url)) {
      galleryUrls.push(url);
    }
  }

  return {
    heroImageUrl,
    galleryUrls,
  };
}

function buildListingImageMap(): Record<string, ListingImageSet> {
  const map: Record<string, ListingImageSet> = {};
  const perPlaceIndex: Record<string, number> = {};

  for (const destination of seedData.destinations) {
    const placeSlug = destination.place.slug;
    perPlaceIndex[placeSlug] ??= 0;

    for (const listing of destination.listings) {
      const listingSlug = slugify(listing.title);
      const images = imagesForPlace(placeSlug, perPlaceIndex[placeSlug]);
      perPlaceIndex[placeSlug] += 1;
      if (images) map[listingSlug] = images;
    }
  }

  return map;
}

/** Per-listing fixes when place pool order picks a broken or mismatched photo */
const LISTING_OVERRIDES: Record<string, ListingImageSet> = {
  "devbagh-beachside-camping-retreat": {
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Devbagh.jpg/1280px-Devbagh.jpg",
    galleryUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Devbag_Backwaters.jpg/1280px-Devbag_Backwaters.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sangam_at_devbagh_photo_by_Rahul_kharade_(bhandup)_-_panoramio_(2).jpg/1280px-Sangam_at_devbagh_photo_by_Rahul_kharade_(bhandup)_-_panoramio_(2).jpg",
    ],
  },
};

export const LISTING_IMAGES: Record<string, ListingImageSet> = {
  ...buildListingImageMap(),
  ...LISTING_OVERRIDES,
};

export function getListingImages(slug: string): ListingImageSet | null {
  return LISTING_IMAGES[slug] ?? null;
}
