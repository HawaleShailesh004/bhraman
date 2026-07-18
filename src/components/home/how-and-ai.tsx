"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { COPY } from "@/lib/marketing-copy";
import { brandEase } from "@/lib/motion";

export function HowItWorksSection() {
  const reduce = useReducedMotion();

  return (
    <section className="page-shell section-y">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
          {COPY.how.eyebrow}
        </p>
        <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight text-ink">
          {COPY.how.title}
        </h2>
      </div>
      <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
        {COPY.how.steps.map((step, index) => (
          <motion.li
            key={step.title}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.4, delay: index * 0.07, ease: brandEase }
            }
            className="relative rounded-[18px] border border-line bg-white p-5 sm:p-6"
          >
            <span className="font-display text-4xl font-black text-amber/35">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-body">{step.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export function AiPlannerBand() {
  return (
    <section className="page-shell section-y">
      <div className="relative overflow-hidden rounded-[22px] bg-ink px-6 py-10 text-paper sm:px-12 sm:py-14">
        <div
          className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-amber/20 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 max-w-xl">
          <span className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber">
            <Sparkles size={13} /> {COPY.ai.eyebrow}
          </span>
          <h2 className="font-display text-[clamp(1.45rem,3.2vw,2rem)] font-bold leading-tight text-paper">
            {COPY.ai.title}
          </h2>
          <p className="mt-2 text-sm text-[#C9D2CB]">{COPY.ai.sub}</p>
          <Link
            href="/plan"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text shadow-amber-glow transition-transform hover:-translate-y-px"
          >
            <Sparkles size={16} /> {COPY.ai.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
