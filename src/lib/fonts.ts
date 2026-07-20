import { Fraunces } from "next/font/google";

/**
 * Display: Fraunces variable + opsz (matches bhraman_hero_redesign.html).
 * Body: Satoshi via Fontshare CDN in layout.tsx (400/500/700).
 *
 * When `axes` is set, weight must be omitted or "variable".
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const fontVariables = fraunces.variable;
