"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { scoreTier } from "@/lib/operator-scores";

export function ExperienceBadge({
  score,
  compact = false,
}: {
  score: number;
  compact?: boolean;
}) {
  if (score <= 0) return null;
  const tier = scoreTier(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tier.className}`}
      title={`Experience score ${score}/100 · ${tier.label}`}
    >
      <Sparkles size={10} />
      {compact ? score : `Exp ${score}`}
    </span>
  );
}

export function SafetyBadge({
  score,
  compact = false,
}: {
  score: number;
  compact?: boolean;
}) {
  if (score <= 0) return null;
  const tier = scoreTier(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tier.className}`}
      title={`Safety score ${score}/100 · ${tier.label}`}
    >
      <ShieldCheck size={10} />
      {compact ? score : `Safety ${score}`}
    </span>
  );
}

export function TrustScoreRow({
  experienceScore,
  safetyScore,
}: {
  experienceScore: number;
  safetyScore: number;
}) {
  if (experienceScore <= 0 && safetyScore <= 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ExperienceBadge score={experienceScore} />
      <SafetyBadge score={safetyScore} />
    </div>
  );
}
