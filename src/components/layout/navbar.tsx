"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AuthNav } from "@/components/layout/auth-nav";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/plan", label: "Plan with AI" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/operators", label: "Operators" },
  { href: "/operator/enter", label: "For Operators" },
];

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function Navbar({ onDark = false }: { onDark?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !onDark;

  return (
    <>
      <motion.header
        initial={false}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6"
        animate={{
          paddingTop: scrolled ? 10 : 18,
          paddingBottom: scrolled ? 10 : 18,
        }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div
          className="max-w-6xl mx-auto flex items-center gap-5 rounded-full pl-5 pr-2.5 py-2.5 border transition-colors duration-300"
          style={{
            background: solid ? "rgba(250,248,243,0.85)" : "rgba(26,46,34,0.28)",
            borderColor: solid ? "var(--color-line)" : "rgba(255,255,255,0.18)",
            backdropFilter: "blur(14px)",
            boxShadow: solid ? "var(--shadow-md)" : "none",
          }}
        >
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size={28} dark={!solid} />
            <span
              className="font-display text-[17px] font-bold tracking-tight"
              style={{ color: solid ? "#1A2E22" : "#FAF8F3" }}
            >
              Bhraman
            </span>
          </Link>

          <nav className="ml-3 hidden items-center gap-4 md:flex xl:gap-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={
                  l.href !== "/" && pathname.startsWith(l.href)
                    ? "page"
                    : undefined
                }
                className="text-[13px] font-medium transition-opacity hover:opacity-100 opacity-75"
                style={{ color: solid ? "#1A2E22" : "#FAF8F3" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <button
            type="button"
            className="hidden sm:grid place-items-center w-10 h-10 rounded-full border bg-white/90 transition-transform hover:scale-105"
            style={{ borderColor: "var(--color-line)" }}
            aria-label="Saved"
          >
            <Heart size={17} className="text-ink" />
          </button>
          <AuthNav solid={solid} />

          <button
            type="button"
            className="md:hidden grid place-items-center w-10 h-10 rounded-full"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            <Menu size={22} style={{ color: solid ? "#1A2E22" : "#FAF8F3" }} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[70] w-[78%] max-w-xs bg-paper p-6 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size={30} />
                <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-semibold py-3 border-b border-line"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href={clerkConfigured ? `/sign-in?redirect_url=${encodeURIComponent(pathname)}` : "/bookings"}
                  onClick={() => setOpen(false)}
                  className="text-lg font-semibold py-3 border-b border-line"
                >
                  {clerkConfigured ? "Sign in" : "My bookings"}
                </Link>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
