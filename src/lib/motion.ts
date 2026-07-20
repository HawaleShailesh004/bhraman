"use client";

import {
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";

/** Landing scroll-reveal ease - cubic-bezier(0.22, 1, 0.36, 1) */
export const brandEase = [0.22, 1, 0.36, 1] as const;

export const revealDuration = 0.6;
export const staggerGap = 0.07;

export function useMotionSafe() {
  const prefersReduced = useReducedMotion();
  return !prefersReduced;
}

export function fadeUp(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: revealDuration,
        delay,
        ease: brandEase,
      },
    },
  };
}

export function fadeIn(delay = 0): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: revealDuration,
        delay,
        ease: brandEase,
      },
    },
  };
}

export function fadeScale(delay = 0): Variants {
  return {
    hidden: { opacity: 0, scale: 1.05 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: revealDuration,
        delay,
        ease: brandEase,
      },
    },
  };
}

export function slideStep(direction: 1 | -1 = 1): Variants {
  return {
    enter: { opacity: 0, x: direction * 18 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -14 },
  };
}

export const springTap: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 24,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
};

export function reduced(transition: Transition, enabled: boolean): Transition {
  if (enabled) return transition;
  return { duration: 0 };
}
