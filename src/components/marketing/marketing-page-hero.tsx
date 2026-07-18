"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { brandEase } from "@/lib/motion";

/**
 * Full-bleed marketing hero — brand-forward, one composition, no cards.
 */
export function MarketingPageHero({
  eyebrow,
  title,
  titleLine2,
  sub,
  imageUrl,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  titleLine2?: string;
  sub: string;
  imageUrl: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[min(88svh,720px)] items-end overflow-hidden pt-28 sm:min-h-[640px] sm:pt-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(14,27,19,0.94) 0%, rgba(14,27,19,0.62) 42%, rgba(14,27,19,0.35) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, rgba(224,138,43,0.22), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="page-shell relative z-10 w-full pb-14 sm:pb-20">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: brandEase }}
          className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-amber"
        >
          {eyebrow}
        </motion.p>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04, ease: brandEase }}
          className="mb-3 font-display text-[clamp(2.4rem,8vw,4.5rem)] font-black leading-[0.92] tracking-tight text-paper"
        >
          Bhraman
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: brandEase }}
          className="max-w-[18ch] font-display text-[clamp(1.65rem,4.5vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-paper"
        >
          {title}
          {titleLine2 ? (
            <>
              <br />
              {titleLine2}
            </>
          ) : null}
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: brandEase }}
          className="mt-5 max-w-lg text-base leading-relaxed text-[#C9D2CB] sm:text-lg"
        >
          {sub}
        </motion.p>
        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: brandEase }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {primaryCta ? (
              <Link
                href={primaryCta.href}
                className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-bold text-amber-text shadow-amber-glow transition-transform hover:-translate-y-px"
              >
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-white/15"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </motion.div>
        )}
      </div>
    </section>
  );
}
