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
  ShieldCheck,
  UsersRound,
  Bus,
  Ticket,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { OperatorAvatar } from "@/components/ui/operator-avatar";

const NAV = [
  { icon: LayoutGrid, label: "Overview", href: "/operator" },
  { icon: CalendarDays, label: "Bookings", href: "/operator/bookings" },
  { icon: Bus, label: "Batches", href: "/operator/batches" },
  { icon: Mountain, label: "My listings", href: "/operator/listings" },
  { icon: Ticket, label: "Coupons", href: "/operator/coupons" },
  { icon: CalendarClock, label: "Availability", href: "/operator/availability" },
  { icon: UsersRound, label: "Customers", href: "/operator/customers" },
  { icon: UsersRound, label: "Team & fleet", href: "/operator/team" },
  { icon: ShieldCheck, label: "Verification", href: "/operator/verification" },
  { icon: Wallet, label: "Payouts", href: "/operator/payouts" },
] as const;

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function OperatorShell({
  businessName,
  logoUrl,
  verificationStatus,
  children,
}: {
  businessName: string;
  logoUrl?: string | null;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  children: React.ReactNode;
}) {
  const path = usePathname();

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
                aria-current={active ? "page" : undefined}
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
            <OperatorAvatar
              name={businessName}
              src={logoUrl}
              size="sm"
              rounded="full"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{businessName}</div>
              <Link
                href="/operator/verification"
                className="inline-flex items-center gap-1.5 text-xs text-[#7C8A80] transition-colors hover:text-amber"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    verificationStatus === "VERIFIED"
                      ? "bg-forest"
                      : verificationStatus === "PENDING"
                        ? "bg-amber"
                        : "bg-mist"
                  }`}
                />
                {verificationStatus === "VERIFIED"
                  ? "Verified operator"
                  : verificationStatus === "PENDING"
                    ? "Verification pending"
                    : "Complete verification"}
              </Link>
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

      <main className="min-w-0 bg-paper px-4 py-5 sm:p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={25} />
            <span className="font-display text-base font-black">Bhraman</span>
          </Link>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              verificationStatus === "VERIFIED"
                ? "bg-[#EAF1EC] text-forest"
                : verificationStatus === "PENDING"
                  ? "bg-[#FBEEDD] text-amber-deep"
                  : "bg-paper-2 text-mist"
            }`}
          >
            {verificationStatus === "VERIFIED"
              ? "Verified"
              : verificationStatus === "PENDING"
                ? "Review pending"
                : "Profile incomplete"}
          </span>
        </div>
        <nav
          aria-label="Operator dashboard"
          className="scrollbar-hide -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
        >
          {NAV.map((n) => {
            const active =
              n.href === "/operator" ? path === "/operator" : path.startsWith(n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`touch-target inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-semibold ${
                  active
                    ? "bg-amber text-amber-text"
                    : "border border-line bg-white"
                }`}
              >
                <n.icon size={14} />
                {n.label}
              </Link>
            );
          })}
        </nav>
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
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(1.35rem,4vw,1.5rem)]">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-mist">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function NewListingButton() {
  return (
    <Link
      href="/operator/listings?tab=create"
      className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-[#3A2406] transition-transform hover:-translate-y-0.5"
    >
      <Plus size={17} /> New listing
    </Link>
  );
}
