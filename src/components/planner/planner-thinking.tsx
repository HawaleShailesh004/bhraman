"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trees,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PHRASES: { text: string; sub: string; icon: LucideIcon }[] = [
  {
    text: "Reading your adventure brief…",
    sub: "Picking up on location, budget & vibe",
    icon: Sparkles,
  },
  {
    text: "Scanning verified listings…",
    sub: "Only real operators — no scraped junk",
    icon: Compass,
  },
  {
    text: "Matching difficulty & duration…",
    sub: "Filtering trails that fit your level",
    icon: Trees,
  },
  {
    text: "Checking safety & operator ratings…",
    sub: "Verified guides and reviewed experiences",
    icon: ShieldCheck,
  },
  {
    text: "Comparing prices near your area…",
    sub: "Finding value within your budget",
    icon: Wallet,
  },
  {
    text: "Ranking your best fits…",
    sub: "Almost there — crafting recommendations",
    icon: MapPin,
  },
];

const PHRASE_MS = 2600;

function ThinkingOrb() {
  return (
    <div className="relative h-11 w-11 shrink-0">
      <div className="absolute inset-0 rounded-full bg-ink shadow-[0_4px_14px_rgba(26,46,34,0.2)]" />

      <motion.div
        className="absolute inset-0.5 rounded-full border border-amber/25"
        animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.12, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-1.5 rounded-full border border-amber/15"
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      {[0, 120, 240].map((startDeg, i) => (
        <motion.div
          key={startDeg}
          className="absolute inset-0"
          initial={{ rotate: startDeg }}
          animate={{ rotate: startDeg + 360 }}
          transition={{
            duration: 2.4 + i * 0.7,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span
            className="absolute left-1/2 top-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber"
            style={{
              boxShadow: "0 0 8px rgba(224, 138, 43, 0.55)",
            }}
          />
        </motion.div>
      ))}

      <div className="absolute inset-0 grid place-items-center">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={16} className="text-amber" />
        </motion.div>
      </div>
    </div>
  );
}

export function PlannerThinking() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, PHRASE_MS);
    return () => clearInterval(timer);
  }, []);

  const phrase = PHRASES[index];
  const Icon = phrase.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex gap-3"
    >
      <ThinkingOrb />

      <div className="relative min-w-0 flex-1 overflow-hidden rounded-[16px_4px_16px_16px] border border-line/80 bg-white px-4 py-3.5 shadow-[var(--shadow-sm)]">
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-paper-2">
          <motion.div
            className="h-full w-1/4 bg-gradient-to-r from-transparent via-amber to-transparent"
            animate={{ x: ["-120%", "520%"] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="flex items-start gap-2.5"
          >
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FBEEDD] text-amber-deep">
              <Icon size={13} strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{phrase.text}</p>
              <p className="mt-0.5 text-xs text-mist">{phrase.sub}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-3.5 flex gap-1">
          {PHRASES.map((_, i) => (
            <div
              key={i}
              className="relative h-1 flex-1 overflow-hidden rounded-full bg-paper-2"
            >
              {i === index ? (
                <motion.div
                  key={`fill-${index}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-amber"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: PHRASE_MS / 1000, ease: "linear" }}
                />
              ) : (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-amber transition-all duration-300"
                  style={{ width: i < index ? "100%" : "0%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
