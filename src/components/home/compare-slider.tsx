"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Pattern 08 - Drag-to-compare: WhatsApp chaos vs Bhraman.
 */
const BEFORE = [
  "14 Instagram DMs, no replies",
  "Advance UPI to a stranger",
  "No refund if it rains",
  '"Is it even safe?" - no way to know',
] as const;

const AFTER = [
  "Three verified trips",
  "Money held in escrow",
  "Weather cancels → full refund",
  "Batch mix + reviews, visible",
] as const;

export function CompareSlider() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPct(Math.max(6, Math.min(94, next)));
  }, []);

  return (
    <section className="section-y bg-paper">
      <div className="page-shell max-w-[1000px]">
        <div className="mb-7 max-w-xl">
          <p className="mb-2 text-[13px] font-bold uppercase tracking-eyebrow text-amber-deep">
            Feel the difference
          </p>
          <h2 className="font-display text-[clamp(28px,3.4vw,42px)] font-medium leading-[1.02] tracking-tight text-ink">
            Drag chaos into calm.
          </h2>
        </div>

        <div
          ref={ref}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Compare WhatsApp booking vs Bhraman"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPct((p) => Math.max(6, p - 4));
            if (e.key === "ArrowRight") setPct((p) => Math.min(94, p + 4));
          }}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            setFromClientX(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          className="relative h-[380px] cursor-ew-resize select-none overflow-hidden rounded-[22px] sm:h-[420px]"
        >
          {/* Before */}
          <div className="absolute inset-0 flex flex-col justify-center bg-[#241f1c] p-8 text-warm-white sm:p-11">
            <p className="mb-4 text-xs font-bold uppercase tracking-eyebrow text-clay">
              The WhatsApp way
            </p>
            <ul className="flex max-w-[28ch] flex-col gap-3">
              {BEFORE.map((row) => (
                <li
                  key={row}
                  className="flex items-start gap-2.5 text-[15px] opacity-90"
                >
                  <span className="text-clay" aria-hidden>
                    ✕
                  </span>
                  {row}
                </li>
              ))}
            </ul>
          </div>

          {/* After (clipped) */}
          <div
            className="absolute inset-0 flex flex-col justify-center bg-forest p-8 text-warm-white sm:p-11"
            style={{
              clipPath: reduce ? "inset(0 0 0 50%)" : `inset(0 0 0 ${pct}%)`,
            }}
          >
            <p className="mb-4 text-right text-xs font-bold uppercase tracking-eyebrow text-amber">
              The Bhraman way
            </p>
            <ul className="ml-auto flex max-w-[28ch] flex-col items-end gap-3 text-right">
              {AFTER.map((row) => (
                <li
                  key={row}
                  className="flex items-start gap-2.5 text-[15px] opacity-90"
                >
                  {row}
                  <span className="text-amber" aria-hidden>
                    ✓
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Handle */}
          <div
            className="pointer-events-none absolute inset-y-0 z-[5] w-0.5 bg-paper"
            style={{
              left: `${reduce ? 50 : pct}%`,
              transform: "translateX(-50%)",
            }}
          />
          <div
            className="pointer-events-none absolute top-1/2 z-[6] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-base text-ink shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            style={{ left: `${reduce ? 50 : pct}%` }}
            aria-hidden
          >
            ⇄
          </div>
        </div>
      </div>
    </section>
  );
}
