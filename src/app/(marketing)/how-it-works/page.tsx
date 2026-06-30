import Link from "next/link";
import {
  Search,
  Sparkles,
  CreditCard,
  Mountain,
  ShieldCheck,
  CloudSun,
  MessageSquare,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Eyebrow, TopoLines } from "@/components/ui/primitives";

const STEPS = [
  {
    icon: Search,
    t: "Discover",
    d: "Browse verified experiences across Maharashtra - filter by activity, difficulty, budget, and region.",
  },
  {
    icon: Sparkles,
    t: "Plan with AI",
    d: "Describe your ideal weekend in plain words. Our AI finds real, bookable matches and explains why they fit.",
  },
  {
    icon: CreditCard,
    t: "Book securely",
    d: "Pick a date, choose your group size, and pay safely via UPI, card, or netbanking. Instant confirmation.",
  },
  {
    icon: Mountain,
    t: "Go adventure",
    d: "Meet your verified operator on the ground. They handle the execution - you just show up and explore.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar onDark />
      <section
        className="relative overflow-hidden pt-36 pb-20"
        style={{ background: "linear-gradient(160deg,#1A2E22,#2D5A3D)" }}
      >
        <TopoLines opacity={0.14} />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber">
            How it works
          </span>
          <h1 className="mt-3 mb-4 font-display text-[clamp(32px,6vw,56px)] font-black leading-tight text-paper">
            From idea to summit
            <br />
            in four steps
          </h1>
          <p className="text-lg text-[#C9D2CB]">
            Bhraman makes adventure tourism simple, safe, and trustworthy.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <div
              key={s.t}
              className="flex items-start gap-6 rounded-[22px] border border-line bg-white p-7 shadow-[var(--shadow-sm)]"
            >
              <div className="flex shrink-0 flex-col items-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF1EC] text-forest">
                  <s.icon size={26} />
                </span>
                <span className="mt-2 font-display text-2xl font-black text-line">
                  0{i + 1}
                </span>
              </div>
              <div className="pt-1">
                <h3 className="mb-2 font-display text-2xl">{s.t}</h3>
                <p className="leading-relaxed text-[#54635A]">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-2 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <Eyebrow>Built on trust</Eyebrow>
            <h2 className="font-display text-[clamp(26px,4vw,38px)]">
              Why travelers choose Bhraman
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                t: "Verified operators",
                d: "Every operator is vetted, badged, and rated by real travelers.",
              },
              {
                icon: CloudSun,
                t: "Live conditions",
                d: "See weather and safety signals before you commit to a date.",
              },
              {
                icon: MessageSquare,
                t: "Transparent everything",
                d: "Clear pricing, honest cancellation policies, no surprises.",
              },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-[22px] border border-line bg-white p-7"
              >
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF1EC] text-forest">
                  <f.icon size={24} />
                </span>
                <h3 className="mb-2 font-display text-xl">{f.t}</h3>
                <p className="text-sm leading-relaxed text-[#54635A]">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-amber px-7 py-4 font-bold text-[#3A2406] transition-transform hover:-translate-y-0.5"
            >
              Start exploring
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
