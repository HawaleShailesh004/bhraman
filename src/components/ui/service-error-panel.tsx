"use client";

import Link from "next/link";
import { AlertTriangle, WifiOff } from "lucide-react";

export function ServiceErrorPanel({
  title = "Something went wrong",
  description = "We couldn't load this page. Try again in a moment.",
  reset,
  homeHref = "/",
  homeLabel = "Go home",
  unavailable = false,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  homeHref?: string;
  homeLabel?: string;
  unavailable?: boolean;
}) {
  const Icon = unavailable ? WifiOff : AlertTriangle;

  return (
    <div className="mx-auto max-w-lg rounded-[16px] border border-line bg-white p-8 text-center shadow-[var(--shadow-sm)]">
      <Icon className="mx-auto text-clay" size={28} />
      <h2 className="mt-3 font-display text-xl font-medium tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed tracking-sub text-mist">
        {description}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {reset ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
          >
            Try again
          </button>
        ) : null}
        <Link
          href={homeHref}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
