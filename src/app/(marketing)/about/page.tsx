import Link from "next/link";
import { Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Eyebrow, TopoLines } from "@/components/ui/primitives";

export default function AboutPage() {
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
            Our story
          </span>
          <h1 className="mt-3 mb-4 font-display text-[clamp(32px,6vw,56px)] font-black leading-tight text-paper">
            Making Maharashtra&apos;s wild accessible to all
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#C9D2CB]">
            We believe everyone deserves a safe, trustworthy way to experience
            the Sahyadris, the Konkan coast, and beyond.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="prose-custom space-y-6 text-lg leading-relaxed text-[#33433A]">
          <p className="font-serif text-2xl italic text-forest">
            Maharashtra has some of India&apos;s most spectacular adventure
            terrain - yet booking it has always meant scattered WhatsApp groups,
            unverified guides, and uncertainty.
          </p>
          <p>
            Bhraman exists to fix that. We&apos;re a trust-first marketplace
            connecting weekend adventurers with verified local operators who
            handle the on-ground execution. We handle discovery, planning, and
            secure payments - they handle the magic in the mountains and rivers.
          </p>
          <p>
            Every operator on our platform is vetted and badged. Every review
            comes from a real, completed booking. Every listing shows live
            weather and honest cancellation terms. Because adventure should feel
            exciting - not risky in the wrong ways.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["50+", "Destinations", false],
            ["60+", "Experiences", false],
            ["100%", "Verified", false],
            ["4.8", "Avg rating", true],
          ].map(([n, l, showStar]) => (
            <div key={String(l)} className="rounded-[18px] bg-paper-2 p-5 text-center">
              <div className="flex items-center justify-center gap-1 font-display text-3xl font-black text-forest">
                {n}
                {showStar ? (
                  <Star size={22} className="fill-amber text-amber-deep" aria-hidden />
                ) : null}
              </div>
              <div className="mt-1 text-sm text-mist">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-2 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Eyebrow>Our values</Eyebrow>
          <h2 className="mb-10 font-display text-[clamp(26px,4vw,38px)]">
            What we stand for
          </h2>
          <div className="grid gap-6 text-left sm:grid-cols-3">
            {[
              {
                t: "Safety first",
                d: "Verified operators, live conditions, and real safety signals on every listing.",
              },
              {
                t: "Local & authentic",
                d: "We champion Maharashtra's own operators and the communities they support.",
              },
              {
                t: "Radically transparent",
                d: "Honest pricing, clear policies, and reviews you can actually trust.",
              },
            ].map((v) => (
              <div
                key={v.t}
                className="rounded-[18px] border border-line bg-white p-6"
              >
                <h3 className="mb-2 font-display text-lg">{v.t}</h3>
                <p className="text-sm leading-relaxed text-[#54635A]">{v.d}</p>
              </div>
            ))}
          </div>
          <Link
            href="/become-operator"
            className="mt-12 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-bold text-paper transition-transform hover:-translate-y-0.5"
          >
            Become an operator
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
