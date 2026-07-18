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
  heroImageUrl?: string | null
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

/** Fallback cover art when a category has no listing photo yet */
export const CATEGORY_COVERS: Record<string, string> = {
  trekking:
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
  rafting:
    "https://images.unsplash.com/photo-1530870110042-98b2cb11041f?auto=format&fit=crop&w=900&q=80",
  camping:
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
  paragliding:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  rappelling:
    "https://images.unsplash.com/photo-1522163181143-5316a0a4d3d2?auto=format&fit=crop&w=900&q=80",
  caving:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  kayaking:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
  fort:
    "https://images.unsplash.com/photo-1582510003544-4d00b07f74c7?auto=format&fit=crop&w=900&q=80",
};

