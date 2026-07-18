"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, CloudSun, LockKeyhole } from "lucide-react";
import { COPY } from "@/lib/marketing-copy";
import { brandEase } from "@/lib/motion";

const ITEMS = [
  {
    icon: BadgeCheck,
    title: COPY.why.items[0].title,
    text: COPY.why.items[0].text,
  },
  {
    icon: CloudSun,
    title: COPY.why.items[1].title,
    text: COPY.why.items[1].text,
  },
  {
    icon: LockKeyhole,
    title: COPY.why.items[2].title,
    text: COPY.why.items[2].text,
  },
] as const;

export function WhyBhramanSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink py-16 text-paper sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(224,138,43,0.18), transparent 45%)",
        }}
        aria-hidden
      />
      <div className="page-shell relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber">
            {COPY.why.eyebrow}
          </p>
          <h2 className="font-display text-[clamp(1.6rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-paper">
            {COPY.why.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-5">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.4, delay: index * 0.08, ease: brandEase }
              }
              className="border-t border-white/15 pt-6"
            >
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-amber">
                <item.icon size={20} />
              </span>
              <h3 className="mb-2 font-display text-lg font-bold text-paper">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[#B7C4BB]">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
