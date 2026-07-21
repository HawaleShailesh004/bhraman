export type GenderMixInput = {
  female: number;
  male: number;
  other?: number;
  booked: number;
};

export type GenderMixResult = {
  womenPct: number | null;
  menPct: number | null;
  label: string;
  shortLabel: string;
  privacyMode: boolean;
};

function pct(part: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((part / total) * 100);
}

/** Format batch gender composition for display with privacy guard for small groups. */
export function formatGenderMix(input: GenderMixInput): GenderMixResult {
  const other = input.other ?? 0;
  const known = input.female + input.male + other;
  const booked = Math.max(input.booked, known);

  if (booked <= 0) {
    return {
      womenPct: null,
      menPct: null,
      label: "No bookings yet",
      shortLabel: "-",
      privacyMode: false,
    };
  }

  if (booked < 4) {
    return {
      womenPct: null,
      menPct: null,
      label: "Mixed group · details after more seats fill",
      shortLabel: "Mixed group",
      privacyMode: true,
    };
  }

  const womenPct = pct(input.female, booked);
  const menPct = pct(input.male, booked);

  const parts: string[] = [];
  if (womenPct !== null && input.female > 0) {
    parts.push(`${womenPct}% women`);
  }
  if (menPct !== null && input.male > 0) {
    parts.push(`${menPct}% men`);
  }
  if (other > 0) {
    parts.push(`${pct(other, booked)}% other`);
  }

  const label =
    parts.length > 0 ? parts.join(" · ") : `${booked} travelers confirmed`;

  return {
    womenPct,
    menPct,
    label,
    shortLabel: label,
    privacyMode: false,
  };
}

/** Compact count + percent for operator dashboards. */
export function formatGenderMixCounts(input: GenderMixInput): string {
  const mix = formatGenderMix(input);
  if (mix.privacyMode) {
    return `${input.booked} booked · ${mix.shortLabel}`;
  }
  return `${input.female}F · ${input.male}M${input.other ? ` · ${input.other}O` : ""} · ${mix.shortLabel}`;
}
