"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function AuthNav({ solid }: { solid: boolean }) {
  const pathname = usePathname();
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;

  if (!clerkConfigured) {
    return (
      <Link
        href="/bookings"
        className="hidden sm:inline-flex items-center rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-transform hover:-translate-y-px"
      >
        My bookings
      </Link>
    );
  }

  return (
    <>
      <SignedOut>
        <Link
          href={signInHref}
          className="hidden sm:inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
          style={{
            borderColor: solid ? "var(--color-line)" : "rgba(255,255,255,0.25)",
            color: solid ? "#1A2E22" : "#FAF8F3",
            background: solid ? "white" : "transparent",
          }}
        >
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/bookings"
          className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition-colors"
          style={{
            color: solid ? "#1A2E22" : "#FAF8F3",
            background: solid ? "var(--color-paper-2)" : "rgba(255,255,255,0.12)",
          }}
        >
          My bookings
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </SignedIn>
    </>
  );
}
