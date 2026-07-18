"use client";

import {
  BadgeCheck,
  CloudSun,
  LockKeyhole,
  MapPinned,
  UsersRound,
} from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingCtaBand,
  Reveal,
} from "@/components/marketing/reveal";
import { softSpring } from "@/lib/motion";
import { motion, useReducedMotion } from "framer-motion";

const HERO_IMG =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80";

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "Safety you can check",
    text: "Verified operators, real reviews from completed trips, and clear safety signals before you pay.",
  },
  {
    icon: MapPinned,
    title: "Local, not generic",
    text: "Maharashtra operators who know the ridge, the tide, and the chai stop — not a national template.",
  },
  {
    icon: LockKeyhole,
    title: "Money held until you're back",
    text: "You pay Bhraman. We release to the operator after the trip. Cancelled for weather? Full refund.",
  },
] as const;

const SIGNALS = [
  { value: "Sahyadris → Konkan", label: "Terrain we cover" },
  { value: "Verified first", label: "Operator standard" },
  { value: "Held payments", label: "Until you're home" },
  { value: "Live weather", label: "On every listing" },
] as const;

export function AboutPageContent() {
  const reduce = useReducedMotion();

  return (
    <>
      <MarketingPageHero
        eyebrow="About us"
        title="Maharashtra's wild,"
        titleLine2="made bookable."
        sub="Scattered WhatsApp groups and stranger UPI shouldn't be how you book a ridge. We built Bhraman so adventure feels exciting — not risky in the wrong ways."
        imageUrl={HERO_IMG}
        primaryCta={{ href: "/discover", label: "Browse adventures" }}
        secondaryCta={{ href: "/how-it-works", label: "How it works" }}
      />

      <section className="section-y bg-paper">
        <div className="page-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
              The gap
            </p>
            <h2 className="mt-3 max-w-[14ch] font-display text-[clamp(1.7rem,4vw,2.5rem)] font-bold tracking-tight text-ink">
              Spectacular terrain. Broken booking.
            </h2>
          </Reveal>
          <div className="space-y-6 text-base leading-relaxed text-body sm:text-lg">
            <Reveal delay={0.05}>
              <p className="font-serif text-[1.35rem] italic leading-snug text-forest sm:text-[1.5rem]">
                Fort trails, monsoon rivers, coastal camps — Maharashtra has the
                trips. Finding a trustworthy operator was the hard part.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                Bhraman is a trust-first marketplace. We handle discovery,
                planning, and secure payments. Verified local operators handle
                the on-ground trip. You get a real listing, honest weather, and
                money that isn&apos;t sitting in a stranger&apos;s UPI.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>
                Every review comes from a completed booking. Every verified badge
                means checks passed. Every cancellation policy is written in
                plain language — because the mountains are wild enough already.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-y bg-ink text-paper">
        <div className="page-shell">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber">
              What we stand for
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight">
              Three lines we won&apos;t blur.
            </h2>
          </Reveal>

          <div className="space-y-0 divide-y divide-white/10 border-y border-white/10">
            {PILLARS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <motion.div
                  whileHover={reduce ? undefined : { x: 6 }}
                  transition={softSpring}
                  className="grid gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-8 sm:py-10"
                >
                  <div className="flex items-center gap-4 sm:block">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-amber">
                      <item.icon size={22} />
                    </span>
                    <span className="font-display text-3xl font-black text-white/15 sm:mt-4 sm:block">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#A8B7AD] sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-paper-2">
        <div className="page-shell">
          <Reveal className="mb-10 max-w-xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
              Built in the open
            </p>
            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.1rem)] font-bold tracking-tight text-ink">
              Signals you can read before you book.
            </h2>
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {SIGNALS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div className="bg-white p-6 sm:p-7">
                  <p className="font-display text-lg font-bold text-ink sm:text-xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-mist">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF1EC] px-3 py-1.5 text-xs font-semibold text-forest">
              <UsersRound size={13} /> Batch gender mix on listings
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-ink-muted">
              <CloudSun size={13} /> Weather go / no-go
            </span>
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        eyebrow="Join the trail"
        title="Whether you trek or lead the trek."
        sub="Browse verified experiences — or list your own and reach weekend adventurers across Maharashtra."
        primary={{ href: "/discover", label: "Start exploring" }}
        secondary={{ href: "/become-operator", label: "Become an operator" }}
      />
    </>
  );
}
