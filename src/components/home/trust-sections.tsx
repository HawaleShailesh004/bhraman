"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, UsersRound } from "lucide-react";
import { COPY } from "@/lib/marketing-copy";
import { brandEase, softSpring } from "@/lib/motion";

export function KnowTheRoomSection() {
  const reduce = useReducedMotion();

  return (
    <section className="page-shell section-y">
      <div className="grid items-center gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
            Traveler signals
          </p>
          <h2 className="max-w-[18ch] font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight text-ink">
            {COPY.safety.header}
          </h2>
          <p className="mt-3 max-w-md text-sm text-body">{COPY.safety.sub}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF1EC] px-3 py-1.5 text-xs font-semibold text-forest">
              <UsersRound size={13} /> 4 women on this batch
            </span>
            <span className="rounded-full bg-paper-2 px-3 py-1.5 text-xs font-semibold text-ink-muted">
              Woman-led
            </span>
            <span className="rounded-full bg-paper-2 px-3 py-1.5 text-xs font-semibold text-ink-muted">
              Verified reviews
            </span>
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: brandEase }}
          className="rounded-[22px] border border-line bg-white p-5 shadow-[var(--shadow-md)] sm:p-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist">
            Batch
          </p>
          <p className="mt-2 font-display text-xl font-bold text-ink">
            Kalsubai sunrise
          </p>
          <p className="mt-1 text-sm text-body">Sat · 4:30 AM</p>
          <div className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-mist">Confirmed</span>
              <span className="font-semibold text-ink">6W · 3M</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-mist">Women guides</span>
              <span className="font-semibold text-ink">2 of 5</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-paper-2">
              <motion.div
                className="h-full rounded-full bg-forest"
                initial={{ width: 0 }}
                whileInView={{ width: "72%" }}
                viewport={{ once: true }}
                transition={reduce ? { duration: 0 } : softSpring}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function TrustFaqSection() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-paper-2 section-y">
      <div className="page-shell mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
          {COPY.faq.eyebrow}
        </p>
        <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight text-ink">
          {COPY.faq.title}
        </h2>

        <div className="mt-10 w-full space-y-2 text-left">
          {COPY.faq.items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-[14px] border border-line bg-white"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                >
                  <span className="font-display text-base font-bold text-ink">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={softSpring}
                    className="shrink-0 text-mist"
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={
                        reduce ? { opacity: 0 } : { height: 0, opacity: 0 }
                      }
                      animate={
                        reduce
                          ? { opacity: 1 }
                          : { height: "auto", opacity: 1 }
                      }
                      exit={
                        reduce ? { opacity: 0 } : { height: 0, opacity: 0 }
                      }
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.28, ease: brandEase }
                      }
                      className="overflow-hidden"
                    >
                      <p className="border-t border-line px-4 pb-4 pt-3 text-sm leading-relaxed text-body sm:px-5">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
