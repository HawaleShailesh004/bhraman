"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { softSpring } from "@/lib/motion";

type Tone = "paper" | "ink";

const TONE_CLASS: Record<Tone, string> = {
  paper:
    "border-line bg-white text-ink shadow-[var(--shadow-sm)] disabled:opacity-30",
  ink: "border-white/15 bg-white/5 text-paper disabled:opacity-35",
};

export function CarouselNavButton({
  side,
  disabled,
  onClick,
  tone = "paper",
  className = "",
}: {
  side: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
  tone?: Tone;
  className?: string;
}) {
  const reduce = Boolean(useReducedMotion());

  return (
    <motion.button
      type="button"
      aria-label={side === "left" ? "Scroll left" : "Scroll right"}
      disabled={disabled}
      onClick={onClick}
      whileHover={reduce || disabled ? undefined : { scale: 1.06 }}
      whileTap={reduce || disabled ? undefined : { scale: 0.94 }}
      transition={softSpring}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-opacity disabled:cursor-not-allowed ${TONE_CLASS[tone]} ${className}`}
    >
      {side === "left" ? (
        <ChevronLeft size={18} strokeWidth={2.25} />
      ) : (
        <ChevronRight size={18} strokeWidth={2.25} />
      )}
    </motion.button>
  );
}
