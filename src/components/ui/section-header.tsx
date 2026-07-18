import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "paper" | "ink";

const EYEBROW: Record<Tone, string> = {
  paper: "text-amber-deep",
  ink: "text-amber",
};

const TITLE: Record<Tone, string> = {
  paper: "text-ink",
  ink: "text-paper",
};

const LINK: Record<Tone, string> = {
  paper: "text-amber-deep",
  ink: "text-amber",
};

/**
 * Shared section header: eyebrow + title + optional trailing action.
 */
export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel,
  tone = "paper",
  actions,
  className = "",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
  tone?: Tone;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-6 flex flex-wrap items-end justify-between gap-4 ${className}`}
    >
      <div>
        <p
          className={`mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ${EYEBROW[tone]}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`font-display text-[clamp(1.45rem,3.2vw,2.2rem)] font-bold tracking-tight ${TITLE[tone]}`}
        >
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {href && linkLabel ? (
          <Link
            href={href}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2 ${LINK[tone]}`}
          >
            {linkLabel} <ArrowRight size={15} />
          </Link>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
