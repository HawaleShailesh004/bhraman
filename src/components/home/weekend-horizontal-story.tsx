"use client";

import { motion, useReducedMotion } from "framer-motion";
import { brandEase } from "@/lib/motion";
import { FloatingCarouselRail } from "@/components/ui/floating-carousel-rail";
import { TiltShell } from "@/components/ui/tilt-shell";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

/**
 * Pattern 02 - Horizontal weekend story with floating carousel nav + tilt.
 */
const BEATS = [
  {
    when: "Friday, 9 PM",
    title: "The group chat spirals",
    desc: "14 Instagram operators, 3 opinions, zero decisions. Paste it into Bhraman instead.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bonnet_macaque_at_Malshej_Ghat%2C_India..jpg/1280px-Bonnet_macaque_at_Malshej_Ghat%2C_India..jpg",
  },
  {
    when: "Saturday, 5 AM",
    title: "Headlamps on the ridge",
    desc: "Verified operator, known meeting point, weather already checked. You just show up.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kalsubai_summit.jpg/1280px-Kalsubai_summit.jpg",
  },
  {
    when: "Saturday, 7 AM",
    title: "The summit earns the view",
    desc: "Six women on the batch, a woman leading it. Nobody had to make an awkward call to check.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Kalavantinicha_Durga.jpg/1280px-Kalavantinicha_Durga.jpg",
  },
  {
    when: "Sunday, 11 AM",
    title: "Chai, then home",
    desc: "Trip done, operator paid, your review counts because you actually went.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bhandardara_Lake.jpg/1280px-Bhandardara_Lake.jpg",
  },
] as const;

const CARD_STEP = 300 + 20;

export function WeekendHorizontalStory() {
  const reduce = useReducedMotion();
  const { ref, canLeft, canRight, scrollByDir } = useHorizontalScroll(
    CARD_STEP,
    [BEATS.length],
  );

  return (
    <section className="section-y bg-paper">
      <div className="page-shell mb-6">
        <p className="mb-2 text-[13px] font-bold uppercase tracking-eyebrow text-amber-deep">
          The weekend
        </p>
        <h2 className="font-display text-[clamp(28px,3.4vw,42px)] font-medium leading-[1.02] tracking-tight text-ink">
          Told sideways.
        </h2>
      </div>

      <FloatingCarouselRail
        scrollRef={ref}
        canLeft={canLeft}
        canRight={canRight}
        onScroll={scrollByDir}
      >
        {BEATS.map((beat, i) => (
          <motion.div
            key={beat.when}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.4, delay: i * 0.06, ease: brandEase }
            }
            className="w-[min(78vw,300px)] shrink-0 snap-center [perspective:1100px]"
          >
            <TiltShell
              enabled={!reduce}
              className="group h-[400px] rounded-[20px]"
            >
              <article className="relative h-full overflow-hidden rounded-[20px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={beat.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.06]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(transparent 45%, rgba(15,29,21,0.9))",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 z-[1] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber">
                    {beat.when}
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl font-medium leading-[1.05] text-warm-white">
                    {beat.title}
                  </h3>
                  <p className="mt-2 max-h-0 overflow-hidden text-[13.5px] leading-[1.45] text-warm-white/80 opacity-0 transition-all duration-[400ms] group-hover:max-h-20 group-hover:opacity-100">
                    {beat.desc}
                  </p>
                </div>
              </article>
            </TiltShell>
          </motion.div>
        ))}
      </FloatingCarouselRail>
    </section>
  );
}
