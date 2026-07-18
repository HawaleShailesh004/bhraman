"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brandEase } from "@/lib/motion";

const BEATS = [
  {
    when: "Friday",
    phrase: "Friday chaos",
    title: "Group chat spiral.",
    text: "Too many tabs. No one verified.",
    cue: "Chaos",
  },
  {
    when: "Saturday",
    phrase: "Saturday ridge",
    title: "One verified departure.",
    text: "Open seats. Money held.",
    cue: "Ridge",
  },
  {
    when: "Sunday",
    phrase: "Sunday chai",
    title: "Back. Payment releases.",
    text: "Operator paid. No chase.",
    cue: "Chai",
  },
] as const;

const slideEase = [0.22, 0.61, 0.36, 1] as const;
const sceneEase = [0.16, 1, 0.3, 1] as const;

/** Forward: enter from left, exit to right. Reverse flips. */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? -40 : 40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? 40 : -40,
    opacity: 0,
  }),
};

function SceneShell({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 origin-center will-change-transform"
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? 1 : 1.04,
      }}
      transition={{ duration: 0.9, ease: sceneEase }}
      style={{ pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
    >
      {children}
    </motion.div>
  );
}

function SceneChaos({ active }: { active: boolean }) {
  return (
    <SceneShell active={active}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, #2a3d32 0%, #0E1B13 55%, #08110C 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,rgba(250,248,243,0.5)_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="absolute left-[8%] top-[18%] w-[72%] max-w-sm space-y-2.5 sm:left-[12%]">
        {[
          { side: "them", w: "92%", label: "Bro which operator is legit 😭" },
          { side: "them", w: "78%", label: "This one is ₹2.5k that one ₹4k??" },
          { side: "me", w: "70%", label: "Wait is insurance even included" },
          { side: "them", w: "85%", label: "Just send advance on UPI lol" },
        ].map((bubble, i) => (
          <motion.div
            key={bubble.label}
            initial={false}
            animate={
              active
                ? { opacity: 1, y: 0, x: 0 }
                : { opacity: 0, y: 8, x: bubble.side === "me" ? 12 : -12 }
            }
            transition={{
              delay: active ? 0.12 + i * 0.08 : 0,
              duration: 0.45,
              ease: brandEase,
            }}
            className={`rounded-2xl px-3.5 py-2.5 text-[12px] leading-snug shadow-lg sm:text-[13px] ${
              bubble.side === "me"
                ? "ml-auto rounded-br-md bg-amber text-amber-text"
                : "mr-auto rounded-bl-md bg-white/10 text-[#E8EDE9] backdrop-blur-sm"
            }`}
            style={{ width: bubble.w }}
          >
            {bubble.label}
          </motion.div>
        ))}
      </div>
      <p className="absolute bottom-5 left-5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber/80">
        Friday · WhatsApp spiral
      </p>
    </SceneShell>
  );
}

function SceneRidge({ active }: { active: boolean }) {
  return (
    <SceneShell active={active}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #7BA3C4 0%, #A8C4B0 38%, #2D5A3D 72%, #13231A 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[18%] h-16 w-16 -translate-x-1/2 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(circle, #F2C14E 0%, rgba(224,138,43,0.4) 45%, transparent 70%)",
        }}
      />
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 800 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0 320 L0 200 L120 140 L240 210 L360 90 L500 180 L640 70 L800 150 L800 320 Z"
          fill="#1A2E22"
          opacity="0.85"
        />
        <path
          d="M0 320 L0 240 L160 190 L300 250 L460 160 L620 230 L800 180 L800 320 Z"
          fill="#0E1B13"
        />
      </svg>
      <div className="absolute right-[10%] top-[42%] rounded-full bg-amber px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-text shadow-amber-glow">
        Verified · seats open
      </div>
      <p className="absolute bottom-5 left-5 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/80">
        Saturday · The ridge
      </p>
    </SceneShell>
  );
}

function SceneChai({ active }: { active: boolean }) {
  return (
    <SceneShell active={active}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #3D2A18 0%, #1A2E22 45%, #0E1B13 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(224,138,43,0.45), transparent 50%)",
        }}
      />
      <div className="absolute left-1/2 top-1/2 w-[min(70%,220px)] -translate-x-1/2 -translate-y-[42%]">
        <svg viewBox="0 0 200 220" className="w-full drop-shadow-2xl">
          <ellipse cx="100" cy="168" rx="52" ry="10" fill="rgba(0,0,0,0.25)" />
          <path
            d="M48 90 h90 a18 18 0 0 1 18 18 v48 a28 28 0 0 1 -28 28 H76 a28 28 0 0 1 -28 -28 V108 a18 18 0 0 1 18 -18 z"
            fill="#C4A574"
          />
          <path
            d="M156 108 a22 22 0 0 1 0 44"
            fill="none"
            stroke="#A88855"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="98" rx="42" ry="12" fill="#8B5A2B" />
          <path
            d="M78 70 Q85 40 92 55 Q98 35 105 52 Q112 38 118 68"
            fill="none"
            stroke="rgba(250,248,243,0.45)"
            strokeWidth="3"
            strokeLinecap="round"
            className={active ? "animate-pulse" : undefined}
          />
        </svg>
      </div>
      <div className="absolute bottom-[22%] left-1/2 w-[min(80%,280px)] -translate-x-1/2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
        <p className="text-xs font-semibold text-paper">Payment released</p>
        <p className="mt-0.5 text-[11px] text-[#B8C4BB]">
          Operator paid · You didn&apos;t chase anyone
        </p>
      </div>
      <p className="absolute bottom-5 left-5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber/80">
        Sunday · Chai
      </p>
    </SceneShell>
  );
}

export function WeekendStorySection() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    setActiveIndex((prev) => {
      if (prev === next) return prev;
      setDirection(next > prev ? 1 : -1);
      return next;
    });
  });

  const beat = BEATS[activeIndex];

  if (reduce) {
    return (
      <section className="section-y bg-ink text-paper">
        <div className="page-shell">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber">
              Weekend arc
            </p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight">
              Chaos → ridge → chai
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {BEATS.map((b) => (
              <article key={b.when}>
                <span className="mb-3 inline-flex rounded-full bg-amber px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-text">
                  {b.when}
                </span>
                <h3 className="font-display text-lg font-bold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A8B7AD]">
                  {b.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[320vh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.75fr] lg:gap-12 lg:px-8 lg:py-10">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[40px] opacity-50 blur-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 50%, rgba(224,138,43,0.18), transparent 65%)",
              }}
              aria-hidden
            />
            <div className="relative h-[min(78svh,720px)] min-h-[420px] w-full overflow-hidden rounded-[28px] border border-white/[0.12] shadow-[0_28px_80px_rgba(0,0,0,0.45),0_8px_24px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/[0.06]">
              <SceneChaos active={activeIndex === 0} />
              <SceneRidge active={activeIndex === 1} />
              <SceneChai active={activeIndex === 2} />
              <div
                className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]"
                aria-hidden
              />
            </div>
          </div>

          <div className="relative flex min-h-[260px] flex-col justify-center overflow-hidden lg:pl-2">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber">
              Weekend arc
            </p>

            <div className="relative mb-6 h-[clamp(2.6rem,6vw,3.4rem)] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.h2
                  key={beat.phrase}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: slideEase }}
                  className="absolute inset-x-0 top-0 font-display text-[clamp(1.7rem,4vw,2.5rem)] font-bold tracking-tight text-paper"
                >
                  {beat.phrase}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[5.5rem]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.article
                  key={beat.when}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: slideEase }}
                  className="absolute inset-x-0 top-0"
                >
                  <span className="mb-3 inline-flex rounded-full bg-amber px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-text">
                    {beat.when}
                  </span>
                  <h3 className="font-display text-xl font-bold text-paper sm:text-2xl">
                    {beat.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-[#A8B7AD]">
                    {beat.text}
                  </p>
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center gap-2.5" aria-hidden>
              {BEATS.map((b, index) => (
                <span
                  key={b.cue}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === activeIndex
                      ? "w-9 bg-amber"
                      : "w-4 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full origin-left bg-amber"
                style={{ width: progressWidth }}
              />
            </div>

            <Link
              href="/plan"
              className="mt-7 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-amber transition-all hover:gap-2.5"
            >
              Plan this weekend <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
