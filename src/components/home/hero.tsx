"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Search, ShieldCheck, Star } from "lucide-react";
import { TopoLines } from "@/components/ui/primitives";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden pb-28">
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#1A2E22]/75 via-[#1A2E22]/55 to-[#13231A]/85"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(224,138,43,0.2), transparent 55%)",
        }}
        aria-hidden
      />
      <TopoLines opacity={0.1} />
      <svg
        className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 220 L0 140 L180 90 L360 150 L520 70 L700 160 L880 60 L1060 140 L1240 80 L1440 150 L1440 220 Z"
          fill="#13231A"
          opacity="0.55"
        />
        <path
          d="M0 220 L0 180 L200 130 L420 185 L640 120 L860 190 L1080 130 L1300 185 L1440 150 L1440 220 Z"
          fill="#0E1B13"
          opacity="0.7"
        />
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-24">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur"
        >
          <ShieldCheck size={13} className="text-amber" />
          <span className="text-xs font-medium text-paper/90">
            100% verified operators · secure booking
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{
            duration: 0.7,
            delay: 0.08,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.03em] text-paper"
        >
          Maharashtra&apos;s wild, made{" "}
          <span className="text-amber">bookable.</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{
            duration: 0.7,
            delay: 0.16,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="mt-5 max-w-[48ch] text-base leading-relaxed text-[#C9D2CB] sm:text-lg"
        >
          Discover treks, rafting, camping and more - plan your weekend with AI
          and book trusted local operators in minutes.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{
            duration: 0.7,
            delay: 0.24,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:gap-3"
        >
          <Link
            href="/plan"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[#3A2406] shadow-[0_6px_18px_rgba(224,138,43,0.32)] transition-transform hover:-translate-y-px"
          >
            <Sparkles size={16} /> Plan my weekend
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-white/15"
          >
            <Search size={16} /> Browse adventures
          </Link>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-12 flex flex-wrap gap-x-10 gap-y-4 pb-4"
        >
          {[
            { n: "50+", l: "destinations" },
            { n: "60+", l: "experiences" },
            { n: "8", l: "adventure types" },
            { n: "4.8", l: "avg rating", star: true },
          ].map((s) => (
            <div key={s.l}>
              <div className="flex items-center gap-1 font-display text-xl font-bold tracking-tight text-paper sm:text-2xl">
                {s.n}
                {s.star ? (
                  <Star size={15} className="fill-amber text-amber" aria-hidden />
                ) : null}
              </div>
              <div className="text-xs text-[#9DB0A4]">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
