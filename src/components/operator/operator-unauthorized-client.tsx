"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

import { DEMO_OPERATOR_EMAILS, PRIMARY_OPERATOR_EMAIL } from "@/lib/operator-emails";

export function OperatorUnauthorizedClient() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-deep">
          Operator portal
        </span>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
          This account is not an operator
        </h1>
        <p className="mt-2 text-sm text-[#54635A] leading-relaxed">
          You are signed in with a traveler account. Operator dashboards are only
          available to verified partners registered in our system.
        </p>
      </div>

      <div className="rounded-[14px] border border-line bg-white p-4 text-sm text-[#54635A] space-y-2">
        <p className="font-semibold text-ink">To access the operator dashboard:</p>
        <ol className="list-decimal pl-4 space-y-1.5">
          <li>Sign out below</li>
          <li>
            Sign in again with your operator email (e.g.{" "}
            <code className="text-xs bg-paper-2 px-1.5 py-0.5 rounded">
              {DEMO_OPERATOR_EMAILS[0]}
            </code>
            )
          </li>
        </ol>
        <p className="text-xs text-mist pt-1">
          Demo operator emails: {DEMO_OPERATOR_EMAILS.join(", ")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SignOutButton redirectUrl="/operator/sign-in">
          <button
            type="button"
            className="w-full rounded-full bg-amber px-5 py-3 text-sm font-bold text-[#3A2406] shadow-[0_6px_16px_rgba(224,138,43,0.24)]"
          >
            Sign out & use operator email
          </button>
        </SignOutButton>

        <Link
          href="/become-operator"
          className="block w-full rounded-full border border-line bg-white px-5 py-3 text-center text-sm font-semibold text-ink hover:border-ink transition-colors"
        >
          Apply to become an operator
        </Link>

        <Link
          href="/"
          className="block text-center text-sm text-mist hover:text-ink transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
