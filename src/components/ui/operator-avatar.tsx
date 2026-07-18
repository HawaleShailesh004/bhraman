"use client";

import { operatorInitials } from "@/lib/ui-present";
import { resolveOperatorAvatar } from "@/lib/operator-media";

const SIZE: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg sm:h-16 sm:w-16",
  xl: "h-14 w-14 text-lg sm:h-20 sm:w-20 sm:text-2xl",
};

/**
 * Operator face / logo. Prefers a real photo (custom or theme default),
 * falls back to initials only if image fails to load.
 */
export function OperatorAvatar({
  name,
  src,
  size = "md",
  className = "",
  rounded = "xl",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE;
  className?: string;
  rounded?: "md" | "lg" | "xl" | "full";
}) {
  const url = resolveOperatorAvatar(src);
  const initials = operatorInitials(name);
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "md"
        ? "rounded-md"
        : rounded === "lg"
          ? "rounded-lg"
          : "rounded-xl";

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden border border-white/20 bg-forest font-display font-black text-paper shadow-sm ${SIZE[size]} ${radius} ${className}`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="absolute inset-0 z-[1] h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="relative z-0">{initials}</span>
    </span>
  );
}
