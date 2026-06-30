import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Eyebrow, TopoLines } from "@/components/ui/primitives";
import { TrendingUp, Users2, Wallet, ShieldCheck, Check } from "lucide-react";

export default function BecomeOperatorPage() {
  return (
    <main>
      <Navbar onDark />
      <section
        className="relative overflow-hidden pt-36 pb-24"
        style={{ background: "linear-gradient(160deg,#1A2E22,#2D5A3D)" }}
      >
        <TopoLines opacity={0.14} />
        <div className="relative z-10 mx-auto grid max-w-4xl items-center gap-10 px-6 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber">
              For operators
            </span>
            <h1 className="mt-3 mb-4 font-display text-[clamp(32px,6vw,52px)] font-black leading-tight text-paper">
              Fill your trips.
              <br />
              Grow your business.
            </h1>
            <p className="mb-7 text-lg text-[#C9D2CB]">
              List your experiences on Bhraman and reach weekend adventurers
              across Maharashtra. We bring the bookings - you run the trips.
            </p>
            <Link
              href="/operator/enter"
              className="inline-flex items-center gap-2 rounded-full bg-amber px-7 py-4 font-bold text-[#3A2406] shadow-[0_8px_24px_rgba(224,138,43,0.4)] transition-transform hover:-translate-y-0.5"
            >
              Operator sign in
            </Link>
          </div>
          <div className="rounded-[22px] border border-white/15 bg-white/8 p-6 backdrop-blur">
            <div className="mb-4 text-sm font-semibold text-paper/80">
              What you get
            </div>
            <div className="space-y-3">
              {[
                "A dashboard to manage listings & availability",
                "Direct bookings with secure weekly payouts",
                "Verified-operator badge & traveler reviews",
                "Live demand insights for your region",
              ].map((x) => (
                <div
                  key={x}
                  className="flex items-start gap-2.5 text-sm text-paper"
                >
                  <Check size={17} className="mt-0.5 shrink-0 text-amber" /> {x}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <Eyebrow>Why partner with us</Eyebrow>
          <h2 className="font-display text-[clamp(26px,4vw,38px)]">
            Everything you need to scale
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {[
            {
              icon: TrendingUp,
              t: "More bookings",
              d: "Reach travelers actively searching for adventures like yours.",
            },
            {
              icon: Wallet,
              t: "Fast payouts",
              d: "Weekly settlements via Razorpay. Transparent 12% commission.",
            },
            {
              icon: Users2,
              t: "Build trust",
              d: "Verified badges and real reviews grow your reputation.",
            },
            {
              icon: ShieldCheck,
              t: "Less hassle",
              d: "We handle discovery, payments, and support - you run trips.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-[18px] border border-line bg-white p-6"
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
                <f.icon size={22} />
              </span>
              <h3 className="mb-2 font-display text-base">{f.t}</h3>
              <p className="text-sm leading-relaxed text-[#54635A]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-2 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <Eyebrow>Simple onboarding</Eyebrow>
          <h2 className="mb-10 font-display text-[clamp(26px,4vw,38px)]">
            Listed in 3 steps
          </h2>
          <div className="space-y-4 text-left">
            {[
              {
                n: "1",
                t: "Apply & verify",
                d: "Submit your details and certifications. We verify within 48 hours.",
              },
              {
                n: "2",
                t: "Create listings",
                d: "Add your experiences, set availability and pricing in the dashboard.",
              },
              {
                n: "3",
                t: "Start earning",
                d: "Go live, receive bookings, and get paid weekly.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="flex items-start gap-4 rounded-[18px] border border-line bg-white p-5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber font-display font-black text-[#3A2406]">
                  {s.n}
                </span>
                <div>
                  <h3 className="mb-1 font-display text-lg">{s.t}</h3>
                  <p className="text-sm text-[#54635A]">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/operator/enter"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-bold text-paper transition-transform hover:-translate-y-0.5"
          >
            Operator sign in
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
