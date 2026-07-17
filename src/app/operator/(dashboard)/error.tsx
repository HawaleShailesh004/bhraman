"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function OperatorDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-line bg-white p-8 text-center shadow-[var(--shadow-sm)]">
      <AlertTriangle className="mx-auto text-clay" size={28} />
      <h2 className="mt-3 font-display text-xl">Something went wrong</h2>
      <p className="mt-2 text-sm text-mist">
        We could not load this operator page. Try again, or return to overview.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
        >
          Try again
        </button>
        <Link
          href="/operator"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
