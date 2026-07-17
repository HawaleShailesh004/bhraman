"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { TopoLines } from "@/components/ui/primitives";
import { Camera, Send, Play } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const listingStickyPad = pathname?.startsWith("/listings/") ?? false;

  return (
    <footer
      className={`relative mt-20 overflow-hidden bg-ink text-paper ${
        listingStickyPad
          ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0"
          : ""
      }`}
    >
      <TopoLines opacity={0.1} />
      <div className="page-shell relative z-10 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Logo size={32} dark />
              <span className="font-display text-xl font-black">Bhraman</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#9DB0A4]">
              Maharashtra&apos;s wild, made bookable. A trust-first marketplace
              connecting adventurers with verified local operators.
            </p>
            <div className="mt-5 flex gap-3">
              {[Camera, Send, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-amber hover:text-amber-text"
                  aria-label="social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {[
            {
              title: "Explore",
              links: [
                { label: "Discover", href: "/discover" },
                { label: "Plan with AI", href: "/plan" },
                { label: "My bookings", href: "/bookings" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About us", href: "/about" },
                { label: "How it works", href: "/how-it-works" },
                { label: "Become an operator", href: "/become-operator" },
              ],
            },
            {
              title: "Operators",
              links: [
                { label: "Dashboard", href: "/operator" },
                { label: "Listings", href: "/operator/listings" },
                { label: "Payouts", href: "/operator/payouts" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-display text-sm font-bold tracking-wide">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[#9DB0A4] transition-colors hover:text-paper"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#7C8A80] sm:flex-row">
          <span>© 2026 Bhraman. Adventure responsibly.</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-paper">
              Privacy
            </Link>
            <Link href="#" className="hover:text-paper">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
