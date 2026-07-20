/**
 * Theme-matched media defaults for operators.
 * Real outdoor people (not initials/logos) - builds visitor trust when no custom media is set.
 */

/** Warm Sahyadri-style ridgeline for profile banners */
export const DEFAULT_OPERATOR_BANNER =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80";

/** Human trail crew - default avatar (trust signal when no logo uploaded) */
export const DEFAULT_OPERATOR_PORTRAIT =
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&h=400&q=80&crop=faces";

export function resolveOperatorAvatar(logoUrl?: string | null): string {
  return logoUrl?.trim() || DEFAULT_OPERATOR_PORTRAIT;
}

/**
 * Banner priority: custom banner → first trip photo → theme default.
 */
export function resolveOperatorBanner(
  bannerUrl?: string | null,
  galleryFirst?: string | null,
): string {
  return bannerUrl?.trim() || galleryFirst?.trim() || DEFAULT_OPERATOR_BANNER;
}
