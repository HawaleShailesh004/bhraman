import Link from "next/link";

import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CloudSun,
  Wallet,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";

import { Footer } from "@/components/layout/footer";

import { Hero } from "@/components/home/hero";

import { ListingCardUi } from "@/components/discovery/listing-card-ui";

import { CategoryIcon } from "@/components/ui/category-icon";

import { Eyebrow } from "@/components/ui/primitives";

import { HOME_CATEGORIES } from "@/lib/ui-present";

import { getListingCards } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  const { listings } = await getListingCards({ page: 1 });

  const featured = listings.slice(0, 6);

  return (
    <main>
      <Navbar onDark />

      <Hero />

      <section className="page-shell relative z-20 -mt-14">
        <div className="flex justify-start gap-3 overflow-x-auto rounded-[var(--radius-card)] border border-line/80 bg-white p-3.5 shadow-[var(--shadow-sm)] scrollbar-hide sm:gap-4 sm:p-4">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/discover?category=${c.slug}`}
              className="flex min-w-[76px] shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-3 transition-colors hover:bg-paper-2"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 text-forest">
                <CategoryIcon slug={c.slug} size={19} />
              </span>

              <span className="whitespace-nowrap text-[11px] font-medium text-ink">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="destinations" className="page-shell section-y pt-16">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <Eyebrow>Handpicked</Eyebrow>

            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight">
              Trending this weekend
            </h2>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-deep transition-all hover:gap-2"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {featured.map((l, i) => (
            <ListingCardUi key={l.id} listing={l} index={i} />
          ))}
        </div>
      </section>

      <section className="section-y bg-paper-2">
        <div className="page-shell">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <Eyebrow>Why Bhraman</Eyebrow>

            <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight">
              We remove the uncertainty from adventure
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,

                title: "Verified operators only",

                text: "Every operator is vetted and badged. See real response times, completed trips, and verified reviews before you book.",
              },

              {
                icon: CloudSun,

                title: "Live weather & safety signals",

                text: "Each experience shows live conditions - so you know a trek or rafting run is actually a go before you commit.",
              },

              {
                icon: Wallet,

                title: "Transparent, secure pricing",

                text: "Clear breakdowns, no hidden fees, free cancellation windows, and secure payments via Razorpay.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-[var(--radius-card)] border border-line/80 bg-white p-6 shadow-[var(--shadow-sm)]"
              >
                <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
                  <f.icon size={20} />
                </span>

                <h3 className="mb-2 font-display text-base font-bold">
                  {f.title}
                </h3>

                <p className="text-sm leading-relaxed text-[#54635A]">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-y">
        <div className="relative overflow-hidden rounded-[22px] bg-ink p-8 text-paper sm:p-12">
          <div className="relative z-10 max-w-xl">
            <span className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber">
              <Sparkles size={13} /> Powered by AI
            </span>

            <h2 className="mb-3 font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-tight text-paper">
              Tell us your vibe.
              <br />
              We&apos;ll plan the weekend.
            </h2>

            <p className="mb-8 max-w-md text-sm leading-relaxed text-[#C9D2CB]">
              Get a ranked, bookable plan in seconds - with reasoning from real
              listings in our catalog.
            </p>

            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[#3A2406] shadow-[0_6px_18px_rgba(224,138,43,0.32)] transition-transform hover:-translate-y-px"
            >
              <Sparkles size={16} /> Try the AI planner
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
