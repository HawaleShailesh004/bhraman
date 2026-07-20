import type { CSSProperties } from "react";
import type { Difficulty } from "@prisma/client";

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; bars: number }
> = {
  EASY: { label: "Easy", bars: 1 },
  MODERATE: { label: "Moderate", bars: 2 },
  CHALLENGING: { label: "Challenging", bars: 3 },
  EXTREME: { label: "Extreme", bars: 4 },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  trekking: "linear-gradient(135deg,#2D5A3D,#1A2E22)",
  rafting: "linear-gradient(135deg,#3A6EA5,#1B3A5C)",
  camping: "linear-gradient(135deg,#C9741C,#8A4A12)",
  paragliding: "linear-gradient(135deg,#4C8055,#1A2E22)",
  rappelling: "linear-gradient(135deg,#4C8055,#2D5A3D)",
  caving: "linear-gradient(135deg,#54635A,#1A2E22)",
  kayaking: "linear-gradient(135deg,#3A6EA5,#1B3A5C)",
  fort: "linear-gradient(135deg,#2D5A3D,#13231A)",
};

export function listingGradient(categorySlug: string) {
  return CATEGORY_GRADIENTS[categorySlug] ?? CATEGORY_GRADIENTS.trekking;
}

export function listingImageStyle(
  categorySlug: string,
  heroImageUrl?: string | null,
): CSSProperties {
  if (heroImageUrl) {
    return {
      backgroundImage: `url(${heroImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: listingGradient(categorySlug) };
}

export function operatorInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export const HOME_CATEGORIES = [
  { slug: "trekking", name: "Trekking" },
  { slug: "rafting", name: "Water Sports" },
  { slug: "camping", name: "Camping" },
  { slug: "paragliding", name: "Paragliding" },
  { slug: "rappelling", name: "Rappelling" },
  { slug: "caving", name: "Caving" },
  { slug: "kayaking", name: "Kayaking" },
  { slug: "fort", name: "Forts" },
] as const;

/** Short lines for category explore cards on marketing home */
export const CATEGORY_BLURBS: Record<string, string> = {
  trekking: "Fort trails & monsoon ridgelines",
  rafting: "Coastal breaks & reservoir adrenaline",
  camping: "Riverside, plateau & forest stays",
  paragliding: "Air time over the Sahyadris",
  rappelling: "Vertical drops, checked rope",
  caving: "Dark passages, counted out",
  kayaking: "Lakes to moving water",
  fort: "History underfoot",
};

/** Maharashtra place photos (Wikimedia) - fallback when a category has no listing hero yet */
export const CATEGORY_COVERS: Record<string, string> = {
  trekking:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kalsubai_summit.jpg/1280px-Kalsubai_summit.jpg",
  rafting:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/River_Kundalika_By_Anis_Shaikh_12.jpg/1280px-River_Kundalika_By_Anis_Shaikh_12.jpg",
  camping:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bhandardara_Lake.jpg/1280px-Bhandardara_Lake.jpg",
  paragliding:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kamshet.jpg/1280px-Kamshet.jpg",
  rappelling:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Devkund_waterfalls.jpg/1280px-Devkund_waterfalls.jpg",
  caving:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/KARLA%27S_CAVES.JPG/1280px-KARLA%27S_CAVES.JPG",
  kayaking:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Devbag_Backwaters.jpg/1280px-Devbag_Backwaters.jpg",
  fort: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Raigad_fort_towers.jpg/1280px-Raigad_fort_towers.jpg",
};
