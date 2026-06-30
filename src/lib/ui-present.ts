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
] as const;
