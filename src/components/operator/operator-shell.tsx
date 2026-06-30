"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  Mountain,
  CalendarClock,
  Wallet,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { operatorInitials } from "@/lib/ui-present";

const NAV = [
  { icon: LayoutGrid, label: "Overview", href: "/operator" },
  { icon: CalendarDays, label: "Bookings", href: "/operator/bookings" },
  { icon: Mountain, label: "My listings", href: "/operator/listings" },
  { icon: CalendarClock, label: "Availability", href: "/operator/availability" },
  { icon: Wallet, label: "Payouts", href: "/operator/payouts" },
] as const;

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function OperatorShell({
  businessName,
  children,
}: {
  businessName: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const initials = operatorInitials(businessName);

  return (
    <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
      <aside className="hidden bg-ink p-5 text-paper lg:flex lg:flex-col">
        <Link href="/" className="mb-8 flex items-center gap-2 px-1.5">
          <Logo size={26} dark />
          <span className="font-display text-[18px] font-black">Bhraman</span>
        </Link>
        <nav className="space-y-1">
          {NAV.map((n) => {
            const active =
              n.href === "/operator" ? path === "/operator" : path.startsWith(n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-amber text-[#3A2406]"
                    : "text-[#A9B8AC] hover:bg-white/6 hover:text-paper"
                }`}
              >
                <n.icon size={17} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-2 py-3">
            <div
              className="grid h-9 w-9 place-items-center rounded-full font-display text-sm font-bold text-paper"
              style={{ background: "linear-gradient(135deg,#2D5A3D,#1A2E22)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{businessName}</div>
              <div className="text-xs text-[#7C8A80]">Verified operator</div>
            </div>
          </div>
          {clerkConfigured ? (
            <SignOutButton>
              <button
                type="button"
                className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#C9D2CB] transition-colors hover:bg-white/6 hover:text-paper"
              >
                Sign out
              </button>
            </SignOutButton>
          ) : null}
        </div>
      </aside>

      <main className="bg-paper p-6 lg:p-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {NAV.map((n) => {
            const active =
              n.href === "/operator" ? path === "/operator" : path.startsWith(n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
                  active ? "bg-ink text-paper" : "border border-line bg-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
        {children}
      </main>
    </div>
  );
}

export function OperatorPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        {subtitle ? <p className="text-sm text-mist">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function NewListingButton() {
  return (
    <Link
      href="/operator/listings"
      className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-[#3A2406] transition-transform hover:-translate-y-0.5"
    >
      <Plus size={17} /> New listing
    </Link>
  );
}
