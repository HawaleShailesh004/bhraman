"use client";

import Link from "next/link";
import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/motion/scroll-reveal";
import type { CategoryDockItem } from "@/lib/home-listings";

/**
 * Category tiles - stagger-up entrance (70ms).
 */
export function CategoryDock({ items }: { items: CategoryDockItem[] }) {
  if (!items.length) return null;

  return (
    <section id="browse" className="bg-paper py-[66px]">
      <div className="page-shell max-w-[1180px]">
        <Reveal kind="up" className="mb-[30px] max-w-xl">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-eyebrow text-amber-deep">
            Choose your adventure
          </p>
          <h2 className="font-display text-[clamp(28px,3.4vw,42px)] font-medium leading-[1.02] tracking-tight text-ink">
            Pick a terrain. We&apos;ll
            <br className="hidden sm:block" /> handle the chaos.
          </h2>
        </Reveal>

        <Stagger
          className="grid grid-cols-2 gap-[14px] sm:grid-cols-4"
          stagger={0.07}
        >
          {items.map((c) => (
            <StaggerItem key={c.slug}>
              <Link
                href={`/discover?category=${c.slug}`}
                className="group relative block h-[158px] overflow-hidden rounded-[16px] border border-sand bg-ink"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.coverUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.08]"
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent [background:linear-gradient(transparent_40%,rgba(15,29,21,0.82))]" />
                <div className="absolute inset-x-0 bottom-0 z-[1] px-4 pb-3.5 pt-8">
                  <p className="font-body text-base font-bold text-warm-white transition-transform duration-300 group-hover:-translate-y-4">
                    {c.name}
                  </p>
                  <p className="mt-0 text-[12.5px] font-normal text-warm-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {c.count} trip{c.count === 1 ? "" : "s"} live
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
