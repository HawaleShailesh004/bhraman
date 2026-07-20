"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import {
  brandEase,
  fadeIn,
  fadeScale,
  fadeUp,
  revealDuration,
  staggerGap,
} from "@/lib/motion";

const viewport = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -10% 0px",
} as const;

type RevealKind = "up" | "in" | "scale";

const variantsFor: Record<RevealKind, ReturnType<typeof fadeUp>> = {
  up: fadeUp(),
  in: fadeIn(),
  scale: fadeScale(),
};

/**
 * Scroll entrance - fade-up / fade-in / scale-settle.
 * Triggers once at ~15% in view.
 */
export function Reveal({
  kind = "up",
  delay = 0,
  className = "",
  children,
  ...rest
}: {
  kind?: RevealKind;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    );
  }

  const base = variantsFor[kind];
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: base.hidden,
        show: {
          ...base.show,
          transition: {
            duration: revealDuration,
            delay,
            ease: brandEase,
          },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children fade-up (60–80ms). Wrap a grid/list.
 */
export function Stagger({
  className = "",
  stagger = staggerGap,
  children,
}: {
  className?: string;
  stagger?: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: revealDuration, ease: brandEase },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
