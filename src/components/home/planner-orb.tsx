"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { COPY } from "@/lib/marketing-copy";
import { Reveal } from "@/components/motion/scroll-reveal";

/**
 * Pattern 14 - Living planner orb - scale-settle entrance + breathing loop.
 */
const PROMPTS = [
  {
    label: "First trek, scared of heights",
    href: "/plan?q=first%20trek%20easy%20scared%20of%20heights",
  },
  {
    label: "Girls' trip, verified safe",
    href: "/plan?q=girls%20trip%20woman%20led%20operator",
  },
  {
    label: "Something extreme under ₹3000",
    href: "/plan?q=challenging%20trek%20under%203000",
  },
  {
    label: "Chill camp near Pune",
    href: "/plan?q=lake%20camping%20near%20pune",
  },
] as const;

export function PlannerOrb() {
  const reduce = useReducedMotion();
  const [ripple, setRipple] = useState(false);
  const [pulse, setPulse] = useState(false);
  const orbRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 900);
    }, 2600);
    return () => window.clearInterval(id);
  }, [reduce]);

  function fireRipple() {
    if (reduce) return;
    setRipple(false);
    requestAnimationFrame(() => setRipple(true));
    const el = orbRef.current;
    if (el) {
      el.style.transform = "scale(0.94)";
      window.setTimeout(() => {
        if (el) el.style.transform = "scale(1)";
      }, 150);
    }
  }

  return (
    <section className="section-y bg-paper">
      <div className="page-shell max-w-[1000px]">
        <div className="relative overflow-hidden rounded-[24px] bg-deep px-6 py-14 text-center sm:px-10 sm:py-16">
          <Reveal kind="scale" className="relative mx-auto mb-8 inline-block">
            <span
              className={`pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] rounded-full border-2 border-amber ${
                ripple ? "animate-orb-ripple" : "opacity-0"
              }`}
              aria-hidden
              onAnimationEnd={() => setRipple(false)}
            />
            <Link
              ref={orbRef}
              href="/plan"
              onClick={fireRipple}
              aria-label="Open AI planner"
              className="relative mx-auto grid h-[130px] w-[130px] place-items-center rounded-full transition-transform duration-300"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #f0a94e, #E08A2B 55%, #b8681c)",
                boxShadow: pulse
                  ? "0 0 80px rgba(224,138,43,0.6)"
                  : "0 0 60px rgba(224,138,43,0.4)",
              }}
            >
              <span
                className="text-[32px] leading-none text-ink/70"
                aria-hidden
              >
                ✦
              </span>
            </Link>
          </Reveal>

          <Reveal kind="up" delay={0.1}>
            <h2 className="font-display text-[clamp(24px,3.2vw,36px)] font-medium tracking-tight text-warm-white">
              Tell me the vibe. I&apos;ll find three real trips.
            </h2>
            <p
              className="mx-auto mt-2 max-w-md text-sm tracking-sub text-warm-white/70"
              data-sub
            >
              {COPY.ai.sub}
            </p>
          </Reveal>

          <Reveal kind="up" delay={0.18}>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              {PROMPTS.map((p) => (
                <Link
                  key={p.label}
                  href={p.href}
                  onClick={fireRipple}
                  className="rounded-full border border-warm-white/20 bg-warm-white/[0.08] px-[18px] py-[11px] text-sm text-warm-white transition-all hover:-translate-y-0.5 hover:border-amber hover:bg-amber hover:text-ink"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
