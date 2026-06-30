/**
 * Add a 3rd gallery image per place via Wikimedia Commons search.
 * Run: node prisma/scripts/expand-place-gallery.mjs
 */
import { readFileSync, writeFileSync } from "fs";

const PLACE_IMAGES = "prisma/data/place-images.json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EXTRA_SEARCH = {
  "kalsubai-peak": "Sunrise Kalsubai peak",
  "lohagad-fort": "Lohagad Vinchu Kata",
  "harishchandragad-fort": "Konkan Kada Harishchandragad",
  "raigad-fort": "Raigad fort ropeway",
  "rajmachi-fort": "Rajmachi fort monsoon",
  "sinhagad-fort": "Sinhagad fort Pune",
  "prabalgad-kalavantin": "Kalavantin Durg steps",
  "sandhan-valley": "Sandhan valley rappelling",
  "tarkarli-coast": "Tarkarli beach scuba",
  "ellora-caves": "Ellora Kailasa temple",
  "ajanta-caves": "Ajanta cave painting interior",
  "pawna-lake": "Pawna lake camping",
  "tapola-shivsagar-lake": "Shivsagar lake Tapola",
  "kundalika-rafting-kolad": "Kundalika river Kolad",
  "malshej-ghat": "Malshej Ghat waterfall",
  "kaas-plateau": "Kaas plateau flowers",
  "bhandardara-arthur-lake": "Randha falls Bhandardara",
  "vasota-fort": "Vasota fort Koyna",
  "ratangad-fort": "Ratangad Nedhe",
  "kamshet-paragliding": "Paragliding Kamshet",
  "panchgani-paragliding": "Paragliding Panchgani",
};

function normalizeThumb(url) {
  if (!url?.includes("upload.wikimedia.org")) return url;
  return url.includes("/thumb/")
    ? url.replace(/\/\d+px-/, "/1280px-")
    : url;
}

async function searchThumb(term) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: term,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "thumburl|mime",
    iiurlwidth: "1280",
    format: "json",
  });

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(
      "https://commons.wikimedia.org/w/api.php?" + params,
      { headers: { "User-Agent": "TrailsMate/1.0 (gallery expand)" } },
    );
    const text = await res.text();
    if (text.includes("too many requests")) {
      await sleep(4000 * (attempt + 1));
      continue;
    }
    const data = JSON.parse(text);
    for (const page of Object.values(data.query?.pages ?? {})) {
      const thumb = page.imageinfo?.[0]?.thumburl;
      const mime = page.imageinfo?.[0]?.mime ?? "";
      if (!thumb || !mime.startsWith("image/")) continue;
      if (/\.(svg|gif)$/i.test(page.title)) continue;
      return normalizeThumb(thumb);
    }
    return null;
  }
  return null;
}

const data = JSON.parse(readFileSync(PLACE_IMAGES, "utf8"));
let added = 0;

for (const [slug, entry] of Object.entries(data)) {
  if ((entry.gallery?.length ?? 0) >= 3) continue;

  const existing = new Set([
    entry.primary,
    ...(entry.gallery ?? []),
  ]);

  const term =
    EXTRA_SEARCH[slug] ??
    slug.replace(/-/g, " ").replace(/\bfort\b/g, "fort Maharashtra");

  console.error(`→ ${slug}: "${term}"`);
  const thumb = await searchThumb(term);
  await sleep(1500);

  if (thumb && !existing.has(thumb)) {
    entry.gallery = [...(entry.gallery ?? []), thumb].slice(0, 3);
    added++;
    console.error(`  ✓ added`);
  } else {
    console.error(`  – skip`);
  }
}

writeFileSync(PLACE_IMAGES, JSON.stringify(data, null, 2) + "\n");
console.log(`Added 3rd gallery for ${added} places`);
