/**
 * Attach curated hero + gallery images to all listings in the database.
 * Run: npx tsx prisma/attach-listing-images.ts
 */

import { PrismaClient } from "@prisma/client";
import { LISTING_IMAGES } from "../src/lib/listing-images";

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    select: { id: true, slug: true, title: true },
    orderBy: { slug: "asc" },
  });

  let updated = 0;
  let missing = 0;

  for (const listing of listings) {
    const images = LISTING_IMAGES[listing.slug];
    if (!images) {
      console.warn(`  ⚠ no image map for "${listing.slug}"`);
      missing++;
      continue;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        heroImageUrl: images.heroImageUrl,
        galleryUrls: images.galleryUrls ?? [images.heroImageUrl],
      },
    });
    console.log(`  ✓ ${listing.title}`);
    updated++;
  }

  const withImages = await prisma.listing.count({
    where: { heroImageUrl: { not: null } },
  });

  console.log(
    `\n✅ Done: ${updated} updated, ${missing} missing maps, ${withImages}/${listings.length} listings have hero images`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
