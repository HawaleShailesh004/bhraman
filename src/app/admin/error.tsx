"use client";

import { AlertTriangle } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-line bg-white p-8 text-center shadow-[var(--shadow-sm)]">
      <AlertTriangle className="mx-auto text-clay" size={28} />
      <h2 className="mt-3 font-display text-xl">Admin page failed to load</h2>
      <p className="mt-2 text-sm text-mist">
        Check your connection and try again. No escrow actions were taken.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-amber-text"
      >
        Try again
      </button>
    </div>
  );
}
