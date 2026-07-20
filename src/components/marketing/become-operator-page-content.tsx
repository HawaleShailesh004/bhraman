"use client";

import Link from "next/link";
import {
  Check,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Users2,
  Wallet,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingCtaBand, Reveal } from "@/components/marketing/reveal";
import { softSpring } from "@/lib/motion";

const HERO_IMG =
  "https://images.unsplash.com/photo-1527489375416-fe880ce21f2b?auto=format&fit=crop&w=1800&q=80";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Fill empty seats",
    text: "Reach weekend adventurers already searching for trips like yours across Maharashtra.",
  },
  {
    icon: Wallet,
    title: "Clear weekly payouts",
    text: "Settlements after trips run. Transparent commission - no surprise deductions.",
  },
  {
    icon: Users2,
    title: "Reputation that compounds",
    text: "Verified badge and reviews from completed bookings - trust travelers can check.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard",
    text: "Listings, availability, bookings, and payouts in one place. We handle discovery and payments.",
  },
] as const;

const ONBOARD = [
  {
    n: "1",
    title: "Apply & verify",
    text: "Submit business details and docs. We review and badge verified operators.",
  },
  {
    n: "2",
    title: "List experiences",
    text: "Add trips, photos, pricing, and open dates. Publish when you're ready.",
  },
  {
    n: "3",
    title: "Run & get paid",
    text: "Accept bookings, lead the trip, receive payout after completion.",
  },
] as const;

export function BecomeOperatorPageContent() {
  const reduce = useReducedMotion();

  return (
    <>
      <MarketingPageHero
        eyebrow="For operators"
        title="Fill your trips."
        titleLine2="Grow on trust."
        sub="List on Bhraman and reach adventurers who want verified operators, honest weather, and payments held until the trip runs. You lead the ground game."
        imageUrl={HERO_IMG}
        primaryCta={{ href: "/operator/enter", label: "Operator sign in" }}
        secondaryCta={{ href: "/how-it-works", label: "How travelers book" }}
      />

      <section className="section-y bg-paper">
        <div className="page-shell">
          <Reveal className="mb-10 max-w-xl sm:mb-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-eyebrow text-amber-deep">
              Why partner
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-medium tracking-tight text-ink">
              Built for operators who run real trips.
            </h2>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.05}>
                <motion.div
                  whileHover={reduce ? undefined : { y: -3 }}
                  transition={softSpring}
                  className="flex gap-4"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
                    <b.icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-medium text-ink">
                      {b.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-body">
                      {b.text}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-ink text-paper">
        <div className="page-shell grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <Reveal>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-eyebrow text-amber">
              What you get
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.3rem)] font-medium tracking-tight">
              Tools to list. Badge to earn trust.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#A8B7AD]">
              Travelers see verification, insurance signals, guide mix, and
              reviews before they book. That&apos;s how empty seats fill.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Dashboard for listings & availability",
                "Secure bookings with held payments",
                "Verified-operator badge & reviews",
                "Demand from Discover + AI planner",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm">
                  <Check size={17} className="mt-0.5 shrink-0 text-amber" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative overflow-hidden rounded-[22px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=80"
                alt=""
                className="aspect-[5/4] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 text-[10px] font-bold text-amber-text">
                  <ShieldCheck size={12} /> Verified on Bhraman
                </p>
                <p className="mt-2 font-display text-xl font-medium">
                  Your name. Your routes. Our marketplace.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-paper-2">
        <div className="page-shell mx-auto max-w-2xl">
          <Reveal className="mb-10 text-center">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-eyebrow text-amber-deep">
              Onboarding
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.3rem)] font-medium tracking-tight text-ink">
              Live in three moves.
            </h2>
          </Reveal>
          <div className="space-y-0 border-t border-line">
            {ONBOARD.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <div className="flex gap-4 border-b border-line py-6 sm:gap-6 sm:py-7">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber font-display text-sm font-medium text-amber-text">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-medium text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-body">
                      {s.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link
              href="/operator/enter"
              className="inline-flex rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-paper transition-transform hover:-translate-y-px"
            >
              Operator sign in
            </Link>
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        eyebrow="Questions"
        title="See how travelers find you."
        sub="Understand the booking flow - then open your dashboard and list your first trip."
        primary={{ href: "/how-it-works", label: "How it works" }}
        secondary={{ href: "/operators", label: "Operator directory" }}
      />
    </>
  );
}
