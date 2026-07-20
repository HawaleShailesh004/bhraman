"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { OperatorDirectoryCardData } from "@/types/listing";
import { OperatorAvatar } from "@/components/ui/operator-avatar";

/**
 * Pattern 09 - Infinite operator marquee (social proof in motion).
 */
export function OperatorMarquee({
  operators,
}: {
  operators: OperatorDirectoryCardData[];
}) {
  const reduce = useReducedMotion();
  const list = operators.length > 0 ? operators.slice(0, 12) : [];

  if (list.length < 2) return null;

  const track = [...list, ...list];

  return (
    <section
      className="overflow-hidden border-y border-sand bg-paper py-7"
      aria-label="Verified operators"
    >
      <div
        className={`flex w-max gap-4 ${
          reduce ? "" : "animate-op-marquee hover:[animation-play-state:paused]"
        }`}
      >
        {track.map((op, i) => (
          <Link
            key={`${op.slug}-${i}`}
            href={`/operators/${op.slug}`}
            className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-sand bg-paper px-5 py-3.5 transition-colors hover:border-ink/20"
          >
            <OperatorAvatar
              name={op.businessName}
              src={op.logoUrl}
              size="sm"
              rounded="md"
              className="!h-[38px] !w-[38px]"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-display text-base font-medium text-ink">
                <span className="truncate">{op.businessName}</span>
                {op.verificationStatus === "VERIFIED" ? (
                  <BadgeCheck
                    size={14}
                    className="shrink-0 text-forest"
                    aria-label="Verified"
                  />
                ) : null}
              </span>
              <span className="block text-xs text-body">
                {op.baseCity}
                {op.yearsOperating ? ` · ${op.yearsOperating}+ yrs` : ""}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
