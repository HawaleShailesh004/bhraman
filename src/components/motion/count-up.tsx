"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Count-up when scrolled into view (cubic ease-out ~1400ms). */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1400,
  className = "",
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(reduce ? to : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        function tick(now: number) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) requestAnimationFrame(tick);
          else setValue(to);
        }
        requestAnimationFrame(tick);
        obs.disconnect();
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration, reduce]);

  const display =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("en-IN");

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
