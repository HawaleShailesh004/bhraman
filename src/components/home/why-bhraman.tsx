"use client";

import { BadgeCheck, CloudSun, LockKeyhole } from "lucide-react";
import { COPY } from "@/lib/marketing-copy";
import { SplitRevealHeadline } from "@/components/ui/split-reveal-headline";
import { Stagger, StaggerItem } from "@/components/motion/scroll-reveal";

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

/** Why Bhraman - word-reveal headline + stagger-up moats */
export function WhyBhramanSection() {
  return (
    <section className="grain section-y relative overflow-hidden bg-deep text-paper">
      <div className="page-shell relative">
        <SplitRevealHeadline
          eyebrow={COPY.why.eyebrow}
          parts={[
            { text: "Know who's leading. Know if it's a go. " },
            { text: "Pay only when it's real.", italic: true },
          ]}
          className="max-w-[20ch] sm:max-w-none"
        />

        <Stagger
          className="mt-14 grid gap-5 md:grid-cols-3 md:gap-5"
          stagger={0.08}
        >
          {ITEMS.map((item) => (
            <StaggerItem
              key={item.title}
              className="border-t border-white/15 pt-6"
            >
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-amber">
                <item.icon size={20} />
              </span>
              <h3 className="mb-2 font-display text-lg font-medium text-paper">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[#B7C4BB]">{item.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
