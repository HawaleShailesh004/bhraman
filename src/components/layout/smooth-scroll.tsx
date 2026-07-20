"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";

/** Site-wide inertial smooth scroll. Honors prefers-reduced-motion. */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
