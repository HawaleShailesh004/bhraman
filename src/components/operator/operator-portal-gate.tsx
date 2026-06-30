"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { OperatorDemoCredentialsCard } from "@/components/operator/operator-demo-credentials";

export function OperatorPortalGateClient() {
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);

  const handleSwitch = () => {
    setLoading(true);
    signOut(() => {
      window.location.href = "/operator/sign-in?switched=1";
    });
  };

  return (
    <main className="min-h-screen bg-paper px-6 py-24 grid place-items-center">
      <div
        className="w-full max-w-md rounded-[22px] border border-line bg-white p-6 shadow-[var(--shadow-lg)]"
        role="alertdialog"
        aria-labelledby="operator-gate-title"
        aria-describedby="operator-gate-desc"
      >
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-deep">
          Operator portal
        </span>
        <h1
          id="operator-gate-title"
          className="mt-2 font-display text-xl font-extrabold tracking-tight"
        >
          Switch to operator account?
        </h1>
        <p id="operator-gate-desc" className="mt-2 text-sm text-[#54635A] leading-relaxed">
          You are currently signed in as a <strong>traveler</strong>. The operator
          dashboard uses a separate login. To continue, you will be signed out of
          your traveler session and taken to operator sign-in.
        </p>

        <div className="mt-4">
          <OperatorDemoCredentialsCard />
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleSwitch}
            disabled={loading}
            className="flex-1 rounded-full bg-amber px-5 py-3 text-sm font-bold text-[#3A2406] shadow-[0_6px_16px_rgba(224,138,43,0.24)] disabled:opacity-60"
          >
            {loading ? "Signing out…" : "Sign out & go to operator sign-in"}
          </button>
          <Link
            href="/"
            className="flex-1 rounded-full border border-line px-5 py-3 text-center text-sm font-semibold text-ink hover:border-ink transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}
