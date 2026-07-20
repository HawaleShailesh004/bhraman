"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/marketing-copy";

/**
 * Pattern 05 - Cursor spotlight cards (escrow + know the room).
 */
const SPOTS = [
  {
    k: "Held in escrow",
    h: "Your money waits until you're back.",
    p: COPY.escrow.primary,
  },
  {
    k: "Know the room",
    h: COPY.safety.header,
    p: COPY.safety.sub,
  },
] as const;

function SpotlightCard({
  k,
  h,
  p,
  reduce,
}: {
  k: string;
  h: string;
  p: string;
  reduce: boolean | null;
}) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      onMouseMove={onMove}
      className="group relative min-h-[220px] overflow-hidden rounded-[20px] bg-deep p-8 sm:p-10"
      style={
        {
          "--mx": "50%",
          "--my": "50%",
        } as CSSProperties
      }
    >
      {!reduce ? (
        <div
          className="pointer-events-none absolute h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            left: "var(--mx)",
            top: "var(--my)",
            background:
              "radial-gradient(circle, rgba(224,138,43,0.25), transparent 60%)",
          }}
          aria-hidden
        />
      ) : null}
      <p className="relative text-xs font-bold uppercase tracking-eyebrow text-amber">
        {k}
      </p>
      <h3 className="relative mt-3.5 max-w-[16ch] font-display text-[28px] font-medium leading-[1.05] text-warm-white">
        {h}
      </h3>
      <p
        className="relative mt-3 max-w-[36ch] text-[14.5px] leading-[1.5] tracking-sub text-warm-white/72"
        data-sub
      >
        {p}
      </p>
    </div>
  );
}

export function SpotlightTrust() {
  const reduce = useReducedMotion();

  return (
    <section className="section-y bg-paper">
      <div className="page-shell grid max-w-[1100px] gap-5 md:grid-cols-2">
        {SPOTS.map((s) => (
          <SpotlightCard key={s.k} {...s} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}
