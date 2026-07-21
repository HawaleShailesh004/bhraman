import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy | Bhraman",
  description:
    "How Bhraman collects, uses, and protects your information when you browse, book, or operate on the platform.",
};

const SECTIONS = [
  {
    t: "What we collect",
    d: "Account details (name, email), booking information, payment references handled by our payment partner, trip safety data (gender, emergency contact, optional medical notes), coupon usage metadata, and basic usage data needed to run Discover, Plan, and operator dashboards.",
  },
  {
    t: "How we use it",
    d: "To create bookings, hold and release payments, show relevant trips, verify operators, prevent fraud, apply operator coupon codes, and improve the product. We do not sell your personal data.",
  },
  {
    t: "Cookies & analytics",
    d: "We use essential cookies for sign-in and checkout. If we add analytics, we will use aggregated, non-sensitive metrics only and update this page.",
  },
  {
    t: "Payments",
    d: "Card, UPI, and netbanking details are processed by our payment provider. Bhraman stores booking and settlement status - not full card numbers.",
  },
  {
    t: "Operators & travelers",
    d: "Operators see traveler details needed to run a booked trip (name, contact, group size, safety notes). Travelers see public operator profile information, trust scores, and listing content.",
  },
  {
    t: "Retention & control",
    d: "We keep booking records as required for payouts, disputes, and legal obligations. You can request account updates or deletion by contacting us; some records may be retained where required.",
  },
  {
    t: "Grievance contact",
    d: "Questions about privacy: privacy@bhraman.in. For Maharashtra marketplace grievances, email with your booking reference and we respond within 7 business days.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar />
      <article className="page-shell section-y pt-28 sm:pt-32">
        <p className="text-[10px] font-bold uppercase tracking-eyebrow text-amber-deep">
          Legal
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-medium tracking-tight text-ink">
          Privacy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          Last updated July 2026. This summary explains how Bhraman handles
          personal information on our Maharashtra adventure marketplace. It is
          not a substitute for formal counsel as you scale.
        </p>
        <div className="mt-12 max-w-2xl space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.t}>
              <h2 className="font-display text-xl font-medium text-ink">
                {s.t}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{s.d}</p>
            </section>
          ))}
        </div>
        <p className="mt-14 text-sm text-mist">
          Also see{" "}
          <Link
            href="/terms"
            className="font-semibold text-amber-deep hover:underline"
          >
            Terms of use
          </Link>
          .
        </p>
      </article>
      <Footer />
    </main>
  );
}
