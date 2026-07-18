"use client";

import Link from "next/link";
import {
  CloudSun,
  CreditCard,
  LockKeyhole,
  Mountain,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingCtaBand,
  Reveal,
} from "@/components/marketing/reveal";
import { brandEase, softSpring } from "@/lib/motion";

const HERO_IMG =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1800&q=80";

const STEPS = [
  {
    icon: Search,
    n: "01",
    title: "Discover",
    text: "Browse verified experiences across Maharashtra. Filter by activity, difficulty, date, and region — every listing is a real operator trip.",
    href: "/discover",
    link: "Open discover",
    image:
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Sparkles,
    n: "02",
    title: "Plan with AI",
    text: "Describe the vibe in plain words. The planner returns bookable matches — not a PDF — with why each trip fits.",
    href: "/plan",
    link: "Try the planner",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: CreditCard,
    n: "03",
    title: "Book securely",
    text: "Pick a date and seats. Pay via UPI, card, or netbanking. Your money is held by Bhraman until the trip runs.",
    href: "/discover",
    link: "See open seats",
    image:
      "https://images.unsplash.com/photo-1530870110042-98b2cb11041f?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Mountain,
    n: "04",
    title: "Show up & go",
    text: "Meet your verified operator on the ground. They run the trip. You explore — with clear meeting points and support if plans change.",
    href: "/operators",
    link: "Meet operators",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
  },
] as const;

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Verified operators",
    text: "Business details checked. Badge means the checks passed — not a marketing sticker.",
  },
  {
    icon: LockKeyhole,
    title: "Money held",
    text: "You pay us. Operator gets paid after the trip. Weather cancel? Full refund, automatically.",
  },
  {
    icon: CloudSun,
    title: "Honest conditions",
    text: "Live weather and go / no-go signals on the listing — even when it costs a booking.",
  },
] as const;

export function HowItWorksPageContent() {
  const reduce = useReducedMotion();

  return (
    <>
      <MarketingPageHero
        eyebrow="How it works"
        title="From vibe to summit"
        titleLine2="without the guesswork."
        sub="Four clear moves: discover, plan, book with money held, then meet a verified operator on the ground."
        imageUrl={HERO_IMG}
        primaryCta={{ href: "/discover", label: "Start exploring" }}
        secondaryCta={{ href: "/plan", label: "Plan with AI" }}
      />

      <section className="section-y bg-paper">
        <div className="page-shell">
          <Reveal className="mb-12 max-w-xl sm:mb-16">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
              The path
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight text-ink">
              Four steps. One booking.
            </h2>
          </Reveal>

          <div className="space-y-16 sm:space-y-24">
            {STEPS.map((step, i) => {
              const flip = i % 2 === 1;
              return (
                <Reveal key={step.n} delay={0.04}>
                  <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                    <div
                      className={`relative overflow-hidden rounded-[22px] ${
                        flip ? "lg:order-2" : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.image}
                        alt=""
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 font-display text-4xl font-black text-paper/90 sm:text-5xl">
                        {step.n}
                      </span>
                    </div>
                    <div className={flip ? "lg:order-1" : undefined}>
                      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1EC] text-forest">
                        <step.icon size={22} />
                      </span>
                      <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-body sm:text-base">
                        {step.text}
                      </p>
                      <Link
                        href={step.href}
                        className="mt-5 inline-flex text-sm font-semibold text-amber-deep transition-all hover:gap-2"
                      >
                        {step.link} →
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-y bg-paper-2">
        <div className="page-shell">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
              Why it feels safe
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight text-ink">
              Trust built into the flow.
            </h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {TRUST.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07}>
                <motion.div
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={softSpring}
                  className="h-full border-t-2 border-forest/30 pt-6"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
                    <item.icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {item.text}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-ink py-16 text-paper sm:py-20">
        <div className="page-shell">
          <Reveal>
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: brandEase }}
              className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 px-6 py-10 sm:px-10 sm:py-12"
            >
              <div
                className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-amber/15 blur-3xl"
                aria-hidden
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber">
                Your money
              </p>
              <h2 className="mt-3 max-w-xl font-display text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold tracking-tight">
                You pay Bhraman. We hold it. Operator paid after you&apos;re
                back.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#A8B7AD]">
                No stranger UPI. If weather cancels the trip, you get a full
                refund — automatically. That&apos;s the whole escrow story in
                plain language.
              </p>
              <Link
                href="/discover"
                className="mt-7 inline-flex rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
              >
                Book with confidence
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        eyebrow="Ready"
        title="Pick a weekend. We'll hold the rest."
        sub="Start on Discover, or tell the AI planner what kind of trip you want."
        primary={{ href: "/discover", label: "Browse adventures" }}
        secondary={{ href: "/plan", label: "Plan with AI" }}
        tone="paper"
      />
    </>
  );
}
