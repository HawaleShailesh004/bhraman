"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Quote moments from bhraman_quote_moments.html:
 * A - Why we built (editorial word reveal)
 * B - What we believe (cinematic over image)
 */

function QuoteWords({
  parts,
}: {
  parts: Array<{ text: string; italic?: boolean }>;
}) {
  return (
    <span data-quote-words>
      {parts.map((part, pi) => {
        const words = part.text.split(/(\s+)/);
        const Wrap = part.italic ? "em" : "span";
        return (
          <Wrap
            key={pi}
            className={part.italic ? "italic text-forest" : undefined}
          >
            {words.map((tok, ti) => {
              if (tok.trim() === "") {
                return <span key={`${pi}-${ti}`}> </span>;
              }
              return (
                <span
                  key={`${pi}-${ti}`}
                  className="q-word inline transition-opacity duration-500"
                  style={{ opacity: 0.12 }}
                >
                  {tok}
                </span>
              );
            })}
          </Wrap>
        );
      })}
    </span>
  );
}

/** Option A - Why we built Bhraman */
export function WhyWeBuiltQuote() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      setProgress(1);
      return;
    }
    function onScroll() {
      const node = ref.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(
        1,
        Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)),
      );
      setProgress(prog);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  useEffect(() => {
    const root = ref.current?.querySelectorAll(".q-word");
    if (!root) return;
    const show = reduce ? root.length : Math.floor(progress * root.length);
    root.forEach((w, i) => {
      (w as HTMLElement).style.opacity = i <= show || reduce ? "1" : "0.12";
    });
  }, [progress, reduce]);

  return (
    <section className="bg-paper py-[clamp(4.5rem,12vw,7rem)]">
      <div className="page-shell max-w-[1000px]">
        <p
          className="font-display text-[clamp(3rem,12vw,90px)] leading-[0.5] text-amber/50"
          aria-hidden
        >
          &ldquo;
        </p>
        <p
          ref={ref}
          className="mt-2.5 font-display text-[clamp(24px,3.6vw,44px)] font-medium leading-[1.2] tracking-sub text-ink "
        >
          <QuoteWords
            parts={[
              {
                text: "Maharashtra has the mountains, the forts, the coast. Finding someone you could ",
              },
              { text: "trust", italic: true },
              {
                text: " to take you there was always the hard part. Not anymore.",
              },
            ]}
          />
        </p>
        <p className="mt-7 text-[15px] font-medium text-body">
          - Why we built Bhraman
        </p>
      </div>
    </section>
  );
}

/** Option B - What we believe (cinematic + staggered lines) */
export function WhatWeBelieveQuote() {
  const reduce = useReducedMotion();
  const lines = [
    <>
      Adventure shouldn&apos;t start with{" "}
      <em className="italic text-amber">anxiety</em>.
    </>,
    <>
      You should know who&apos;s leading, know the weather&apos;s a go, and know
      your money is safe -
    </>,
    <>
      <strong className="font-semibold text-white">before</strong> you ever
      leave home.
    </>,
  ];

  return (
    <section className="grain relative overflow-hidden bg-deep py-[clamp(5rem,14vw,8rem)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kalsubai_summit.jpg/1280px-Kalsubai_summit.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.32]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent, rgba(15,29,21,0.7))",
        }}
        aria-hidden
      />
      <div className="page-shell relative z-[1] max-w-[900px] text-center">
        <p className="mb-6 text-[13px] font-bold uppercase tracking-eyebrow text-amber">
          What we believe
        </p>
        <div className="font-display text-[clamp(26px,3.8vw,46px)] font-normal leading-[1.22] tracking-tight text-warm-white">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: 0.6,
                      delay: i * 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              className={i > 0 ? "mt-1" : undefined}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
