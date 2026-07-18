"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Shared horizontal scroller: arrow enable/disable + stepped scroll.
 * Used by Worth booking, category explore, and similar carousels.
 */
export function useHorizontalScroll(stepPx: number, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const reduce = Boolean(useReducedMotion());

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanLeft(el.scrollLeft > 2);
    setCanRight(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const raf = window.requestAnimationFrame(() => {
      sync();
      window.requestAnimationFrame(sync);
    });

    el.addEventListener("scroll", sync, { passive: true });
    el.addEventListener("scrollend", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(el);

    return () => {
      window.cancelAnimationFrame(raf);
      el.removeEventListener("scroll", sync);
      el.removeEventListener("scrollend", sync);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps passed by caller
  }, [sync, stepPx, ...deps]);

  function scrollByDir(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const next = Math.min(
      maxScroll,
      Math.max(0, el.scrollLeft + dir * stepPx),
    );
    el.scrollTo({
      left: next,
      behavior: reduce ? "auto" : "smooth",
    });
    window.setTimeout(sync, reduce ? 0 : 350);
  }

  return { ref, canLeft, canRight, scrollByDir, reduce };
}
