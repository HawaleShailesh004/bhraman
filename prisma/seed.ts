/**
 * Bhraman - Database Seed Script
 * Loads researched data from prisma/data/seed-data.json into Postgres via Prisma.
 */

import {
  PrismaClient,
  Difficulty,
  ListingStatus,
  SlotStatus,
  UserRole,
} from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import { getListingImages } from "../src/lib/listing-images";

const prisma = new PrismaClient();

type RawOperator = {
  businessName: string;
  baseCity: string;
  bio: string;
  yearStarted: number;
};
type RawListing = {
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
  itinerary: {
    order: number;
    timeLabel?: string;
    title: string;
    description?: string;
  }[];
  cancellationPolicy: Record<string, number>;
  operatorName: string;
};
type RawDestination = {
  place: {
    slug: string;
    name: string;
    city: string;
    district: string;
    state?: string;
    latitude: number;
    longitude: number;
    elevationM?: number | null;
    description: string;
    bestMonths: number[];
    region?: string;
  };
  listings: RawListing[];
};
type SeedFile = { operators: RawOperator[]; destinations: RawDestination[] };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CATEGORIES = [
  { slug: "trekking", name: "Trekking", icon: null },
  { slug: "rafting", name: "Water Sports & Rafting", icon: null },
  { slug: "camping", name: "Camping", icon: null },
  { slug: "paragliding", name: "Paragliding", icon: null },
  { slug: "rappelling", name: "Waterfall Rappelling", icon: null },
  { slug: "caving", name: "Caving", icon: null },
  { slug: "kayaking", name: "Kayaking & Backwater", icon: null },
  { slug: "fort", name: "Fort Exploration", icon: null },
];

const DEFAULT_POLICY = {
  weatherRefundPct: 100,
  cutoffHours: 48,
  beforeCutoffPct: 100,
  afterCutoffPct: 50,
  noShowPct: 0,
};

function generateSlots(durationHours: number, capacity: number) {
  const slots: {
    startTime: Date;
    endTime: Date;
    capacity: number;
    bookedSeats: number;
    status: SlotStatus;
  }[] = [];
  const now = new Date();
  for (let i = 1; i <= 70; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const day = d.getDay();
    if (day === 0 || day === 6) {
      const start = new Date(d);
      start.setHours(6, 0, 0, 0);
      const end = new Date(start.getTime() + durationHours * 3.6e6);
      slots.push({
        startTime: start,
        endTime: end,
        capacity,
        bookedSeats: 0,
        status: SlotStatus.OPEN,
      });
    }
  }
  return slots;
}

async function main() {
  console.log("🌱 Seeding Bhraman...");

  const raw: SeedFile = JSON.parse(
    readFileSync(join(process.cwd(), "prisma/data/seed-data.json"), "utf-8"),
  );

  console.log("→ categories");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
  }
  const categoryBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  console.log("→ operators");
  const operatorByName: Record<string, string> = {};
  for (const op of raw.operators) {
    const email = `${slugify(op.businessName)}@bhraman-operators.demo`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: op.businessName, role: UserRole.OPERATOR },
    });
    const operator = await prisma.operator.upsert({
      where: { userId: user.id },
      update: {
        businessName: op.businessName,
        baseCity: op.baseCity,
        bio: op.bio,
        isVerified: true,
        verifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        businessName: op.businessName,
        baseCity: op.baseCity,
        bio: op.bio,
        isVerified: true,
        verifiedAt: new Date(),
        completedTrips: Math.floor(Math.random() * 1200) + 200,
        avgResponseMins: Math.floor(Math.random() * 30) + 8,
        ratingAvg: +(4.5 + Math.random() * 0.4).toFixed(1),
        ratingCount: Math.floor(Math.random() * 400) + 80,
      },
    });
    operatorByName[op.businessName] = operator.id;
  }

  console.log("→ places, listings, itineraries, slots");
  for (const dest of raw.destinations) {
    const place = await prisma.place.upsert({
      where: { slug: dest.place.slug },
      update: {},
      create: {
        slug: dest.place.slug,
        name: dest.place.name,
        city: dest.place.city,
        district: dest.place.district,
        state: dest.place.state ?? "Maharashtra",
        latitude: dest.place.latitude,
        longitude: dest.place.longitude,
        elevationM: dest.place.elevationM ?? null,
        description: dest.place.description,
        bestMonths: dest.place.bestMonths,
        region: dest.place.region ?? null,
      },
    });

    for (const l of dest.listings) {
      const operatorId = operatorByName[l.operatorName];
      const categoryId = categoryBySlug[l.categorySlug];
      if (!operatorId) {
        console.warn(
          `  ⚠ unknown operator "${l.operatorName}" - skipping listing "${l.title}"`,
        );
        continue;
      }
      if (!categoryId) {
        console.warn(
          `  ⚠ unknown category "${l.categorySlug}" - skipping listing "${l.title}"`,
        );
        continue;
      }

      const listingSlug = slugify(l.title);
      const images = getListingImages(listingSlug);
      const listing = await prisma.listing.upsert({
        where: { slug: listingSlug },
        update: images
          ? {
              heroImageUrl: images.heroImageUrl,
              galleryUrls: images.galleryUrls ?? [images.heroImageUrl],
            }
          : {},
        create: {
          slug: listingSlug,
          operatorId,
          placeId: place.id,
          categoryId,
          title: l.title,
          summary: l.summary,
          description: l.description,
          difficulty: l.difficulty,
          durationHours: l.durationHours,
          basePrice: l.basePrice,
          minGroupSize: l.minGroupSize,
          maxGroupSize: l.maxGroupSize,
          inclusions: l.inclusions,
          exclusions: l.exclusions,
          thingsToCarry: l.thingsToCarry,
          meetingPoint: l.meetingPoint ?? null,
          cancellationPolicy: l.cancellationPolicy ?? DEFAULT_POLICY,
          heroImageUrl: images?.heroImageUrl ?? null,
          galleryUrls: images
            ? (images.galleryUrls ?? [images.heroImageUrl])
            : [],
          status: ListingStatus.PUBLISHED,
          itinerary: {
            create: l.itinerary.map((s) => ({
              order: s.order,
              timeLabel: s.timeLabel ?? null,
              title: s.title,
              description: s.description ?? null,
            })),
          },
          slots: { create: generateSlots(l.durationHours, l.maxGroupSize) },
        },
      });
      console.log(`  ✓ ${listing.title}`);
    }
  }

  console.log("→ demo traveler + sample booking/review");
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@bhraman.app" },
    update: {},
    create: {
      email: "demo@bhraman.app",
      name: "Aditya K.",
      role: UserRole.TRAVELER,
      homeCity: "Pune",
      fitnessLevel: Difficulty.MODERATE,
    },
  });

  const firstListing = await prisma.listing.findFirst({
    include: { slots: true },
  });
  if (firstListing && firstListing.slots[0]) {
    const slot = firstListing.slots[0];
    const existing = await prisma.booking.findFirst({
      where: { userId: demoUser.id, listingId: firstListing.id },
    });
    if (!existing) {
      await prisma.booking.create({
        data: {
          bookingRef: "BHR-DEMO1",
          userId: demoUser.id,
          listingId: firstListing.id,
          slotId: slot.id,
          groupSize: 2,
          pricePerHead: firstListing.basePrice,
          totalAmount: firstListing.basePrice * 2,
          listingTitleSnapshot: firstListing.title,
          startTimeSnapshot: slot.startTime,
          status: "COMPLETED",
        },
      });
      await prisma.review.upsert({
        where: {
          userId_listingId: {
            userId: demoUser.id,
            listingId: firstListing.id,
          },
        },
        update: {},
        create: {
          userId: demoUser.id,
          listingId: firstListing.id,
          rating: 5,
          isVerified: true,
          comment:
            "Guide was punctual and safety-first the whole way. Booking took two minutes.",
        },
      });
    }
  }

  const counts = {
    operators: await prisma.operator.count(),
    places: await prisma.place.count(),
    listings: await prisma.listing.count(),
    slots: await prisma.availabilitySlot.count(),
  };
  console.log("✅ Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
