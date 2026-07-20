"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Pattern 06 - Sticky scrollytelling for How it works.
 * Left steps scroll; right image stays pinned and swaps.
 */
const STEPS = [
  {
    num: "01",
    title: "Tell us the vibe.",
    text: "First trek and scared of heights? Girls' trip? Something that hurts? Say it in plain words - the planner reads it.",
    badge: "Tell the planner",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/AndharBan_valley.jpg/1280px-AndharBan_valley.jpg",
  },
  {
    num: "02",
    title: "Get three real trips.",
    text: "Not a hundred Instagram tabs. Three verified, bookable matches - with why each one fits you.",
    badge: "3 matches found",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kalsubai_summit.jpg/1280px-Kalsubai_summit.jpg",
  },
  {
    num: "03",
    title: "Pay into escrow.",
    text: "Your money's held safe by Bhraman, not sitting in a stranger's UPI. Released only after the trip runs.",
    badge: "Held in escrow",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Raigad_fort_towers.jpg/1280px-Raigad_fort_towers.jpg",
  },
  {
    num: "04",
    title: "Show up and go.",
    text: "Known meeting point, weather already checked, verified operator on the ground. You just trek.",
    badge: "On the ridge",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bhandardara_Lake.jpg/1280px-Bhandardara_Lake.jpg",
  },
] as const;

export function HowItWorksSticky() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reduce) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.step);
          if (!Number.isNaN(i)) setActive(i);
        }
      },
      { threshold: 0.55 },
    );
    stepRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [reduce]);

  return (
    <section className="bg-deep">
      <div className="mx-auto grid max-w-[1200px] lg:grid-cols-2">
        <div className="px-6 sm:px-10 lg:px-12">
          <p className="sticky top-24 z-[1] bg-deep/90 py-6 text-[13px] font-bold uppercase tracking-eyebrow text-amber backdrop-blur-sm lg:static lg:bg-transparent lg:py-10 lg:backdrop-blur-none">
            How it works
          </p>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              data-step={i}
              className={`flex min-h-[auto] flex-col justify-center py-10 transition-opacity duration-500 lg:min-h-[88vh] lg:py-0 ${
                reduce || active === i ? "opacity-100" : "opacity-25"
              }`}
            >
              <p className="mb-4 font-display text-[15px] font-semibold text-amber">
                {step.num}
              </p>
              <h3 className="max-w-[16ch] font-display text-[clamp(28px,3.6vw,44px)] font-medium leading-[1.05] tracking-tight text-warm-white">
                {step.title}
              </h3>
              <p
                className="mt-4 max-w-[40ch] text-base leading-[1.55] tracking-sub text-warm-white/72"
                data-sub
              >
                {step.text}
              </p>

              {/* Mobile: inline image under each step */}
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[20px] lg:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.img}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-deep/80 px-3.5 py-2 text-[13px] font-semibold text-warm-white backdrop-blur-sm">
                  <span className="h-[7px] w-[7px] rounded-full bg-amber" />
                  {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`absolute h-[70%] w-[78%] overflow-hidden rounded-[20px] transition-all duration-700 ${
                  active === i
                    ? "scale-100 opacity-100"
                    : "scale-[1.04] opacity-0"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.img}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-deep/80 px-3.5 py-2 text-[13px] font-semibold text-warm-white backdrop-blur-sm">
                  <span className="h-[7px] w-[7px] rounded-full bg-amber" />
                  {step.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
