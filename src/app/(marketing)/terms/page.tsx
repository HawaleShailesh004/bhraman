import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of use | Bhraman",
  description:
    "Terms for using Bhraman to discover, plan, and book Maharashtra adventure experiences with verified operators.",
};

const SECTIONS = [
  {
    t: "The platform",
    d: "Bhraman connects travelers with independent adventure operators. We provide discovery, planning tools, booking, and payment holding. Operators deliver the on-ground experience.",
  },
  {
    t: "Bookings & payments",
    d: "When you book, you pay Bhraman. Funds are held until the trip runs (or refunded per the listing cancellation policy — including weather cancellations). Operators are paid after completion according to platform rules.",
  },
  {
    t: "Your responsibilities",
    d: "Provide accurate booking details, follow operator safety briefings, and arrive as agreed. Misuse, fraud, or abuse of the platform may result in account suspension.",
  },
  {
    t: "Operator responsibilities",
    d: "Operators must keep listings accurate, meet verification requirements, run trips safely, and honor confirmed bookings subject to published policies.",
  },
  {
    t: "Limitation",
    d: "Adventure activities involve inherent risk. Bhraman is not the trip operator. Liability for on-ground execution sits with the operator, subject to applicable law and any insurance they list.",
  },
  {
    t: "Changes",
    d: "We may update these terms as the product evolves. Continued use after notice means you accept the updated terms for new bookings.",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar />
      <article className="page-shell section-y pt-28 sm:pt-32">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
          Legal
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-ink">
          Terms of use
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          Last updated July 2026. By using Bhraman you agree to these terms for
          browsing, booking, and operating on the marketplace.
        </p>
        <div className="mt-12 max-w-2xl space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.t}>
              <h2 className="font-display text-xl font-bold text-ink">{s.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{s.d}</p>
            </section>
          ))}
        </div>
        <p className="mt-14 text-sm text-mist">
          Also see{" "}
          <Link
            href="/privacy"
            className="font-semibold text-amber-deep hover:underline"
          >
            Privacy
          </Link>
          .
        </p>
      </article>
      <Footer />
    </main>
  );
}
