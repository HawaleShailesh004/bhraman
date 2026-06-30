import Link from "next/link";
import { type ReactNode } from "react";
import { Star } from "lucide-react";
import type { Difficulty } from "@prisma/client";
import { DIFFICULTY_META } from "@/lib/ui-present";

type BtnProps = {
  children: ReactNode;
  variant?: "primary" | "dark" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
  full?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  full,
  type = "button",
  disabled,
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-body text-sm font-semibold rounded-full px-5 py-2.5 transition-all duration-150 cursor-pointer hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-60";
  const variants = {
    primary:
      "bg-amber text-[#3A2406] shadow-[0_6px_16px_rgba(224,138,43,0.24)] hover:shadow-[0_8px_20px_rgba(224,138,43,0.3)]",
    dark: "bg-ink text-paper hover:shadow-md",
    ghost: "bg-white text-ink border-[1.5px] border-line hover:border-ink",
  };
  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "ok",
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "danger" | "info" | "neutral";
}) {
  const tones = {
    ok: "bg-[#EAF1EC] text-forest",
    warn: "bg-[#FBEEDD] text-amber-deep",
    danger: "bg-[#F7E4DF] text-clay",
    info: "bg-[#E6EDF2] text-[#3A6EA5]",
    neutral: "bg-paper-2 text-mist",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function DifficultyMeter({
  difficulty,
  showLabel = true,
}: {
  difficulty: Difficulty;
  showLabel?: boolean;
}) {
  const meta = DIFFICULTY_META[difficulty];
  const heights = [5, 8, 11, 14];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex h-3.5 items-end gap-[2px]">
        {heights.map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-[1px]"
            style={{
              height: h,
              background:
                i < meta.bars ? "var(--color-amber)" : "rgba(26,46,34,0.18)",
            }}
          />
        ))}
      </span>
      {showLabel && <span className="text-[10px] font-semibold">{meta.label}</span>}
    </span>
  );
}

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
      <Star size={12} className="fill-amber text-amber" />
      {rating.toFixed(1)}
      {count !== undefined && (
        <span className="text-[11px] font-medium text-mist">({count})</span>
      )}
    </span>
  );
}

export function TopoLines({
  className = "",
  opacity = 0.18,
  stroke = "#E08A2B",
}: {
  className?: string;
  opacity?: number;
  stroke?: string;
}) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 1200 400"
      style={{ opacity }}
      aria-hidden
    >
      <g fill="none" stroke={stroke} strokeWidth="1">
        <path d="M0 320 Q300 280 600 310 T1200 290" />
        <path d="M0 290 Q300 250 600 280 T1200 260" />
        <path d="M0 260 Q300 215 600 250 T1200 228" />
        <path d="M0 228 Q300 180 600 218 T1200 196" />
        <path d="M0 196 Q300 148 600 186 T1200 164" />
        <path d="M0 164 Q300 116 600 154 T1200 132" />
        <path d="M0 132 Q300 86 600 122 T1200 102" />
        <path d="M0 102 Q300 58 600 92 T1200 74" />
      </g>
    </svg>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-deep">
      {children}
    </div>
  );
}
