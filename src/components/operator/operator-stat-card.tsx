"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp } from "lucide-react";
import type { OperatorStat } from "@/types/operator";

export function OperatorStatCard({
  label,
  value,
  delta,
  i,
}: OperatorStat & { i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      className="rounded-[14px] border border-line bg-white p-4 shadow-[var(--shadow-sm)]"
    >
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-mist">
        {label}
      </div>
      <div className="flex items-center gap-1 font-display text-[28px] font-extrabold tracking-tight">
        {value}
        {label === "Rating" ? (
          <Star size={18} className="fill-amber text-amber-deep" aria-hidden />
        ) : null}
      </div>
      {delta ? (
        <div className="mt-1 flex items-center gap-1 text-xs font-bold text-forest">
          <TrendingUp size={13} /> {delta}
        </div>
      ) : null}
    </motion.div>
  );
}
