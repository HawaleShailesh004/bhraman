import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { TopoLines } from "@/components/ui/primitives";
import { Camera, Send, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-ink text-paper overflow-hidden mt-20">
      <TopoLines opacity={0.1} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo size={32} dark />
              <span className="font-display font-black text-xl">Bhraman</span>
            </div>
            <p className="text-[#9DB0A4] text-sm max-w-xs leading-relaxed">
              Maharashtra&apos;s wild, made bookable. A trust-first marketplace
              connecting adventurers with verified local operators.
            </p>
            <div className="flex gap-3 mt-5">
              {[Camera, Send, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-amber hover:text-[#3A2406] transition-colors"
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
              <h4 className="font-display font-bold text-sm mb-4 tracking-wide">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[#9DB0A4] text-sm hover:text-paper transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-[#7C8A80] text-xs">
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
