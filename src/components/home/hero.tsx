"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { Sparkles, Search } from "lucide-react";
import { TopoLines } from "@/components/ui/primitives";
import { COPY } from "@/lib/marketing-copy";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Multi-speed layers - video drifts fastest, topo mid, ridge slowest
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const topoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const ridgeY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.55, 0.85],
    [1, 0.85, 0.15],
  );

  return (
    <section
      ref={ref}
      className="relative flex min-h-[86vh] items-center justify-center overflow-hidden pb-28 pt-28 sm:min-h-[88vh] sm:pb-32 sm:pt-24"
    >
      {/* Layer 1 - video (deepest, fastest) */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduce ? undefined : { y: videoY }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          className="absolute inset-0 h-[120%] w-full object-cover"
          poster="/images/hero-fallback.jpg"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,46,34,0.78) 0%, rgba(19,35,26,0.58) 45%, rgba(14,27,19,0.94) 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(224,138,43,0.2), transparent 55%)",
          }}
          aria-hidden
        />
      </motion.div>

      {/* Layer 2 - topo lines (mid speed) */}
      <motion.div
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={reduce ? undefined : { y: topoY }}
        aria-hidden
      >
        <TopoLines opacity={0.11} />
      </motion.div>

      {/* Layer 3 - ridge SVG (slowest foreground) */}
      <motion.svg
        className="absolute bottom-0 left-0 right-0 w-full will-change-transform"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        aria-hidden
        style={reduce ? undefined : { y: ridgeY }}
      >
        <path
          d="M0 180 L0 110 L180 70 L360 120 L520 55 L700 125 L880 50 L1060 110 L1240 65 L1440 115 L1440 180 Z"
          fill="#13231A"
          opacity="0.55"
        />
        <path
          d="M0 180 L0 145 L200 105 L420 150 L640 95 L860 155 L1080 105 L1300 150 L1440 120 L1440 180 Z"
          fill="#0E1B13"
          opacity="0.75"
        />
      </motion.svg>

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber"
        >
          {COPY.brandEyebrow}
        </motion.p>

        <motion.h1
          {...fadeUp}
          transition={{
            duration: 0.6,
            delay: 0.05,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="liquid-gradient-text font-display text-[clamp(2.4rem,7.5vw,4.5rem)] font-black leading-[1.02] tracking-[-0.03em]"
        >
          <span className="block">{COPY.hero.headlineLine1}</span>
          <span className="block">{COPY.hero.headlineLine2}</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{
            duration: 0.55,
            delay: 0.1,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="mt-5 max-w-[34ch] text-base leading-relaxed text-[#D0D9D2] sm:max-w-[40ch] sm:text-lg"
        >
          {COPY.hero.subline}
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{
            duration: 0.55,
            delay: 0.16,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="mt-8 flex w-full max-w-md flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3"
        >
          <Link
            href="/plan"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-bold text-amber-text shadow-amber-glow transition-transform hover:-translate-y-px"
          >
            <Sparkles size={16} /> {COPY.hero.ctaPrimary}
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-white/15"
          >
            <Search size={16} /> {COPY.hero.ctaSecondary}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
