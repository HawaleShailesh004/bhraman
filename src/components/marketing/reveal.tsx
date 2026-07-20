"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { brandEase } from "@/lib/motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.45, delay, ease: brandEase }
      }
    >
      {children}
    </motion.div>
  );
}

export function MarketingCtaBand({
  eyebrow,
  title,
  sub,
  primary,
  secondary,
  tone = "ink",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  tone?: "ink" | "paper";
}) {
  const ink = tone === "ink";

  return (
    <section
      className={ink ? "section-y bg-ink text-paper" : "section-y bg-paper-2"}
    >
      <div className="page-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p
            className={`mb-3 text-[10px] font-bold uppercase tracking-eyebrow ${
              ink ? "text-amber" : "text-amber-deep"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`font-display text-[clamp(1.6rem,4vw,2.4rem)] font-medium tracking-tight ${
              ink ? "text-paper" : "text-ink"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-md text-sm leading-relaxed tracking-sub ${
              ink ? "text-[#A8B7AD]" : "text-body"
            }`}
            data-sub
          >
            {sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primary.href}
              className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-bold text-amber-text shadow-amber-glow transition-transform hover:-translate-y-px"
            >
              {primary.label}
            </Link>
            {secondary ? (
              <Link
                href={secondary.href}
                className={`inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
                  ink
                    ? "border-white/20 text-paper hover:bg-white/10"
                    : "border-line text-ink hover:border-ink"
                }`}
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
