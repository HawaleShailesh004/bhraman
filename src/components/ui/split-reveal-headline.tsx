"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Pattern 03 - Split-text scroll reveal (words rise like a title card).
 */
export function SplitRevealHeadline({
  eyebrow,
  parts,
  className = "",
}: {
  eyebrow?: string;
  /** Tokens; use `{ italic: true }` for amber italic spans */
  parts: Array<{ text: string; italic?: boolean }>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => setInView(Boolean(e?.isIntersecting)),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduce]);

  let wordIndex = 0;

  return (
    <div className={className}>
      {eyebrow ? (
        <p className="mb-6 text-[13px] font-bold uppercase tracking-eyebrow text-amber">
          {eyebrow}
        </p>
      ) : null}
      <h2
        ref={ref}
        className="font-display text-[clamp(32px,5.5vw,68px)] font-medium leading-[1.04] tracking-tight text-warm-white"
      >
        {parts.map((part, pi) => {
          const words = part.text.split(/(\s+)/);
          const Wrapper = part.italic ? "em" : "span";
          return (
            <Wrapper
              key={pi}
              className={part.italic ? "italic text-amber" : undefined}
            >
              {words.map((tok, ti) => {
                if (tok.trim() === "") {
                  return <span key={`${pi}-${ti}`}> </span>;
                }
                const delay = wordIndex * 0.06;
                wordIndex += 1;
                return (
                  <span
                    key={`${pi}-${ti}`}
                    className="inline-block overflow-hidden align-top"
                  >
                    <span
                      className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.3,0.9,0.3,1)]"
                      style={{
                        transform: inView
                          ? "translateY(0)"
                          : "translateY(105%)",
                        transitionDelay: reduce ? "0s" : `${delay}s`,
                      }}
                    >
                      {tok}
                    </span>
                  </span>
                );
              })}
            </Wrapper>
          );
        })}
      </h2>
    </div>
  );
}
