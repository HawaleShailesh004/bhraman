import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rows = await prisma.listing.findMany({
  select: { slug: true, galleryUrls: true },
});
const counts = rows.map((r) => r.galleryUrls.length);
console.log(
  `Gallery counts — min: ${Math.min(...counts)}, max: ${Math.max(...counts)}, avg: ${(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1)}`,
);
console.log(`2+ gallery: ${counts.filter((c) => c >= 2).length}/${rows.length}`);
await prisma.$disconnect();
