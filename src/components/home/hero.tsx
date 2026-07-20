"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { COPY } from "@/lib/marketing-copy";
import { brandEase } from "@/lib/motion";

/**
 * Full-viewport cinematic hero - type matched to bhraman_hero_redesign.html
 * (Fraunces 500 display / italic 400 accent, Satoshi body + CTAs).
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.55, 0.85],
    [1, 0.7, 0],
  );

  return (
    <section
      ref={ref}
      className="grain relative flex min-h-[100svh] min-h-[640px] items-end overflow-hidden pb-[72px] pt-28 sm:pb-[88px] sm:pt-32"
    >
      <motion.div
        className="absolute inset-[-10%_0] bg-deep will-change-transform"
        style={reduce ? undefined : { y: mediaY }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          className="absolute inset-0 h-[110%] w-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(180deg, rgba(15,29,21,0.55) 0%, rgba(15,29,21,0.2) 28%, rgba(15,29,21,0.45) 62%, rgba(15,29,21,0.94) 100%)",
              "linear-gradient(90deg, rgba(15,29,21,0.72) 0%, rgba(15,29,21,0.35) 42%, transparent 72%)",
            ].join(", "),
          }}
          aria-hidden
        />
      </motion.div>

      <motion.div
        className="page-shell relative z-10 w-full max-w-[1180px]"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-[14ch] text-left sm:max-w-none">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: brandEase }}
            className="mb-5 text-[13px] font-bold uppercase tracking-eyebrow text-amber"
          >
            {COPY.brandEyebrow}
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: brandEase }}
            className="max-w-[14ch] font-display text-[clamp(48px,7.2vw,104px)] font-medium leading-[0.94] tracking-tight text-warm-white [text-shadow:0_2px_28px_rgba(15,29,21,0.55),0_1px_2px_rgba(15,29,21,0.4)]"
            style={{ fontOpticalSizing: "auto" }}
          >
            {COPY.hero.headlineLine1}
            <br />
            <em className="font-normal italic text-amber [text-shadow:0_2px_20px_rgba(15,29,21,0.45)]">
              {COPY.hero.minusWord}
            </em>{" "}
            {COPY.hero.headlineRest}
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: brandEase }}
            className="mt-5 max-w-[46ch] font-body text-[clamp(13px,1.15vw,15px)] font-normal leading-[1.55] tracking-sub text-warm-white/80"
            data-sub
          >
            {COPY.hero.subline}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: brandEase }}
            className="mt-[38px] flex flex-wrap items-center gap-[14px]"
          >
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-full bg-amber px-[30px] py-4 font-body text-base font-bold text-ink transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-[1.02]"
            >
              {COPY.hero.ctaPrimary}
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-warm-white/40 bg-transparent px-7 py-[15px] font-body text-base font-medium text-warm-white transition-colors hover:border-warm-white hover:bg-warm-white/10"
            >
              {COPY.hero.ctaSecondary}
            </Link>
          </motion.div>
        </div>
      </motion.div>

    </section>
  );
}
