import type { Prisma } from "@prisma/client";

/** Traveler-facing city/region → place cities & regions in the catalog. */
const NEARBY_CITIES: Record<string, string[]> = {
  pune: ["pune", "thakursai", "lonavala", "kamshet", "kolad", "karjat", "lavasa", "mulshi", "velhe"],
  mumbai: ["mumbai", "lonavala", "karjat", "kolad", "kamshet", "navi mumbai", "thane"],
  lonavala: ["lonavala", "kamshet", "karjat", "thakursai", "pune", "tungarli"],
  kolad: ["kolad", "roha", "pali", "nagothane"],
  nashik: ["nashik", "igatpuri", "bhandardara", "trimbak"],
  igatpuri: ["igatpuri", "nashik", "bhandardara"],
  kamshet: ["kamshet", "lonavala", "pune", "tungarli"],
  karjat: ["karjat", "lonavala", "kamshet", "neral"],
  bari: ["bari", "nashik", "igatpuri"],
};

const REGION_ALIASES: Record<string, string[]> = {
  sahyadri: ["sahyadri", "western ghats"],
  "western ghats": ["western ghats", "sahyadri", "northern western ghats"],
  konkan: ["konkan", "coastal konkan"],
};

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

export function expandPlannerLocation(raw?: string) {
  if (!raw) return undefined;
  const token = normalizeToken(raw);
  const nearby = NEARBY_CITIES[token];
  if (nearby) return { kind: "cities" as const, values: nearby };
  const region = REGION_ALIASES[token];
  if (region) return { kind: "regions" as const, values: region };
  if (token.includes("sahyadri")) {
    return { kind: "regions" as const, values: REGION_ALIASES.sahyadri };
  }
  return { kind: "text" as const, value: raw };
}

export function buildPlaceWhere(raw?: string): Prisma.PlaceWhereInput | undefined {
  if (!raw) return undefined;
  const expanded = expandPlannerLocation(raw);

  if (!expanded) return undefined;

  if (expanded.kind === "cities") {
    return {
      OR: expanded.values.map((city) => ({
        city: { contains: city, mode: "insensitive" as const },
      })),
    };
  }

  if (expanded.kind === "regions") {
    return {
      OR: expanded.values.flatMap((region) => [
        { region: { contains: region, mode: "insensitive" as const } },
        { district: { contains: region, mode: "insensitive" as const } },
      ]),
    };
  }

  return {
    OR: [
      { city: { contains: expanded.value, mode: "insensitive" as const } },
      { district: { contains: expanded.value, mode: "insensitive" as const } },
      { name: { contains: expanded.value, mode: "insensitive" as const } },
      { region: { contains: expanded.value, mode: "insensitive" as const } },
    ],
  };
}

export function listingMatchesPlannerLocation(
  listing: { place: { city: string; district: string; name: string; region?: string | null } },
  raw?: string,
) {
  if (!raw) return true;
  const expanded = expandPlannerLocation(raw);
  if (!expanded) return true;

  const haystack =
    `${listing.place.city} ${listing.place.district} ${listing.place.name} ${listing.place.region ?? ""}`.toLowerCase();

  if (expanded.kind === "cities" || expanded.kind === "regions") {
    return expanded.values.some((value) => haystack.includes(value));
  }

  return haystack.includes(normalizeToken(expanded.value));
}
