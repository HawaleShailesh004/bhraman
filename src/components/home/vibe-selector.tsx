"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { brandEase } from "@/lib/motion";

/**
 * Pattern 01 - Interactive vibe selector.
 * Replaces a static AI planner CTA: tap a vibe → image + headline shift → CTA to /plan.
 */
const VIBES = [
  {
    id: "easy",
    label: "First-timer, take it easy",
    line: "First trek, scared of heights - scenic and safe it is.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/AndharBan_valley.jpg/1280px-AndharBan_valley.jpg",
    href: "/plan?q=first%20trek%20easy%20scared%20of%20heights",
  },
  {
    id: "hard",
    label: "Adrenaline, push me",
    line: "Something hard. A summit that earns the view.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kalsubai_summit.jpg/1280px-Kalsubai_summit.jpg",
    href: "/plan?q=challenging%20trek%20under%203000",
  },
  {
    id: "girls",
    label: "Girls' trip",
    line: "A girls' trip - women-led batches, verified safe.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Kalavantinicha_Durga.jpg/1280px-Kalavantinicha_Durga.jpg",
    href: "/plan?q=girls%20trip%20woman%20led%20operator",
  },
  {
    id: "chill",
    label: "Chill by the lake",
    line: "Camp by the water, bonfire, zero rush.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bhandardara_Lake.jpg/1280px-Bhandardara_Lake.jpg",
    href: "/plan?q=lake%20camping%20near%20pune",
  },
] as const;

export function VibeSelector() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = VIBES.find((v) => v.id === activeId) ?? null;

  return (
    <section className="section-y bg-paper">
      <div className="page-shell max-w-[1100px]">
        <div className="relative flex min-h-[340px] items-end overflow-hidden rounded-[24px] bg-deep">
          {/* Crossfade backgrounds */}
          {VIBES.map((v) => (
            <div
              key={v.id}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                backgroundImage: `url(${v.img})`,
                opacity: activeId === v.id ? 1 : 0,
              }}
              aria-hidden
            />
          ))}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(90deg, rgba(15,29,21,0.92) 0%, rgba(15,29,21,0.45) 60%, transparent)",
            }}
            aria-hidden
          />

          <div className="relative z-[2] w-full p-8 sm:p-10">
            <p className="mb-3.5 text-[13px] font-medium uppercase tracking-[0.1em] text-warm-white/60">
              What&apos;s the weekend feeling like?
            </p>
            <motion.p
              key={active?.line ?? "default"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: brandEase }}
              className="max-w-[18ch] font-display text-[clamp(26px,3.8vw,44px)] font-medium leading-[1.02] tracking-tight text-warm-white"
            >
              {active?.line ?? "Pick a vibe - we\u2019ll shape the trip."}
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {VIBES.map((v) => {
                const on = activeId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveId(v.id)}
                    className={`rounded-full border px-[18px] py-[11px] text-[14.5px] font-medium transition-colors ${
                      on
                        ? "border-amber bg-amber text-ink"
                        : "border-warm-white/22 bg-warm-white/10 text-warm-white hover:bg-warm-white/18"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-[22px] min-h-[48px]">
              {active ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: brandEase }}
                >
                  <Link
                    href={active.href}
                    className="inline-flex items-center rounded-full bg-amber px-[26px] py-[13px] font-body text-[15px] font-bold text-ink transition-transform hover:scale-[1.02]"
                  >
                    See 3 matching trips →
                  </Link>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
