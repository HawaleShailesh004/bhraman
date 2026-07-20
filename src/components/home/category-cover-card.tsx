"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CATEGORY_BLURBS,
  CATEGORY_COVERS,
  listingGradient,
} from "@/lib/ui-present";
import { brandEase } from "@/lib/motion";

/** Photo category tile used in the home “Choose your adventure” row. */
export function CategoryCoverCard({
  slug,
  name,
  coverUrl,
  index = 0,
}: {
  slug: string;
  name: string;
  coverUrl?: string | null;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const cover = coverUrl || CATEGORY_COVERS[slug];
  const blurb = CATEGORY_BLURBS[slug] ?? "Bookable, verified trips";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 0.45,
              delay: Math.min(index, 4) * 0.06,
              ease: brandEase,
            }
      }
      className="w-[min(78vw,300px)] shrink-0 snap-start"
    >
      <Link
        href={`/discover?category=${slug}`}
        className="group relative block h-[380px] overflow-hidden rounded-[22px] sm:h-[420px]"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
          style={
            cover
              ? {
                  backgroundImage: `url(${cover})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { background: listingGradient(slug) }
          }
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-2xl font-medium tracking-tight text-paper">
            {name}
          </h3>
          <p className="mt-1.5 text-sm text-white/80">{blurb}</p>
        </div>
      </Link>
    </motion.div>
  );
}
