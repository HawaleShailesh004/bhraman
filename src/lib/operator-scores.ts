import type { ListingCardData } from "@/types/listing";

export type ScoreTier = {
  label: string;
  tone: "excellent" | "good" | "fair";
  className: string;
};

export function scoreTier(score: number): ScoreTier {
  if (score >= 88) {
    return {
      label: "Excellent",
      tone: "excellent",
      className: "bg-[#EAF1EC] text-forest",
    };
  }
  if (score >= 75) {
    return {
      label: "Good",
      tone: "good",
      className: "bg-paper-2 text-ink",
    };
  }
  return {
    label: "Fair",
    tone: "fair",
    className: "bg-[#FBEEDD] text-amber-deep",
  };
}

export type ScoreBreakdownItem = { label: string; value: string };

export function experienceBreakdown(
  operator: ListingCardData["operator"] & {
    experienceScore?: number;
    safetyScore?: number;
  },
): ScoreBreakdownItem[] {
  return [
    {
      label: "Completed trips",
      value: String(operator.completedTrips ?? 0),
    },
    {
      label: "Avg response",
      value: `${operator.avgResponseMins ?? 30} min`,
    },
    {
      label: "Verified",
      value:
        operator.verificationStatus === "VERIFIED" ? "Yes" : "Pending review",
    },
    {
      label: "Traveler rating",
      value: `${operator.ratingAvg.toFixed(1)} (${operator.ratingCount})`,
    },
  ];
}

export function safetyBreakdown(
  operator: ListingCardData["operator"] & {
    experienceScore?: number;
    safetyScore?: number;
    femaleGuideCount?: number;
    totalGuideCount?: number;
    insuranceStatus?: boolean;
    insuranceProvider?: string | null;
  },
): ScoreBreakdownItem[] {
  const guideMix =
    operator.totalGuideCount && operator.totalGuideCount > 0
      ? `${operator.femaleGuideCount ?? 0}/${operator.totalGuideCount} women guides`
      : "Guide mix not listed";
  return [
    {
      label: "Insurance",
      value: operator.insuranceStatus
        ? (operator.insuranceProvider ?? "On file")
        : "Not verified",
    },
    { label: "Guide mix", value: guideMix },
    {
      label: "Verification",
      value:
        operator.verificationStatus === "VERIFIED" ? "Verified operator" : "Unverified",
    },
    {
      label: "Years operating",
      value: operator.yearsOperating ? `${operator.yearsOperating}+ years` : "—",
    },
  ];
}
