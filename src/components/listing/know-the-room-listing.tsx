"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ListingDetailData } from "@/types/listing";
import type { AvailabilitySlotData } from "@/types/listing";
import { COPY } from "@/lib/marketing-copy";
import { formatGenderMix } from "@/lib/gender-mix";

/** Demo face pool - women first for ring styling */
const FACE_POOL = [
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=88&h=88&q=60",
    woman: true,
  },
  {
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=88&h=88&q=60",
    woman: true,
  },
  {
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=88&h=88&q=60",
    woman: true,
  },
  {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=88&h=88&q=60",
    woman: true,
  },
  {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=88&h=88&q=60",
    woman: true,
  },
  {
    src: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=88&h=88&q=60",
    woman: true,
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
  {
    src: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=88&h=88&q=60",
    woman: false,
  },
] as const;

function buildFaces(women: number, men: number) {
  const womenFaces = FACE_POOL.filter((f) => f.woman);
  const menFaces = FACE_POOL.filter((f) => !f.woman);
  const out: { src: string; woman: boolean }[] = [];
  for (let i = 0; i < women; i++) {
    out.push(womenFaces[i % womenFaces.length]!);
  }
  for (let i = 0; i < men; i++) {
    out.push(menFaces[i % menFaces.length]!);
  }
  return out.slice(0, 16);
}

/**
 * Pattern 12 - Know the room on listing detail (live batch gender mix).
 */
export function KnowTheRoomListing({
  listing,
}: {
  listing: ListingDetailData;
}) {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [slot, setSlot] = useState<AvailabilitySlotData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/listings/${listing.slug}/availability`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: AvailabilitySlotData[]) => {
        if (!active) return;
        const withPeople = rows.find(
          (s) => s.femaleCount + s.maleCount + s.otherCount > 0,
        );
        setSlot(withPeople ?? rows[0] ?? null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [listing.slug]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (reduce) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduce, loaded]);

  const women = slot?.femaleCount ?? 0;
  const men = slot?.maleCount ?? 0;
  const other = slot?.otherCount ?? 0;
  const totalBooked = slot?.bookedSeats ?? women + men + other;
  const genderMix = formatGenderMix({
    female: women,
    male: men,
    other,
    booked: totalBooked,
  });
  const femaleGuides = listing.operator.femaleGuideCount;
  const totalGuides = listing.operator.totalGuideCount;
  const womanLed = totalGuides > 0 && femaleGuides > 0;
  const displayFaces =
    totalBooked > 0
      ? buildFaces(women, men + other)
      : womanLed
        ? FACE_POOL.filter((f) => f.woman).slice(
            0,
            Math.min(4, femaleGuides || 2),
          )
        : [];

  const tags = [
    ...(womanLed ? ["Woman-led"] : []),
    "POSH policy in place",
    "Verified reviews from women",
  ];

  if (!loaded) {
    return (
      <div className="rounded-[22px] bg-deep p-8">
        <div className="h-3 w-48 rounded skeleton-shimmer bg-white/10" />
        <div className="mt-4 h-10 w-3/4 rounded skeleton-shimmer bg-white/10" />
      </div>
    );
  }

  const shortName =
    listing.title.length > 42
      ? `${listing.title.slice(0, 40)}…`
      : listing.title;

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-[22px] bg-deep px-6 py-8 sm:px-9 sm:py-10"
    >
      <p className="text-xs font-bold uppercase tracking-eyebrow text-[#E8A0C0]">
        {COPY.safety.header}
      </p>
      <h2 className="mt-3 max-w-[22ch] font-display text-[clamp(1.35rem,2.8vw,1.85rem)] font-medium leading-[1.1] tracking-tight text-warm-white">
        {totalBooked > 0 ? (
          <>
            This batch is{" "}
            <em className="not-italic text-[#E8A0C0]">
              {genderMix.privacyMode ? genderMix.shortLabel : genderMix.label}
            </em>
            {womanLed ? ", woman-led." : "."}
          </>
        ) : womanLed ? (
          <>Woman-led departure - see the room as seats fill.</>
        ) : (
          <>See who&apos;s on the batch before you book.</>
        )}
      </h2>
      <p className="mt-2 text-sm text-warm-white/55">{shortName}</p>

      {displayFaces.length > 0 ? (
        <div className="mt-7 flex flex-wrap items-center gap-1">
          {displayFaces.map((person, i) => (
            <span
              key={`${person.src}-${i}`}
              className={`relative inline-block h-11 w-11 overflow-hidden rounded-full border-2 border-deep transition-all duration-[400ms] ease-[cubic-bezier(0.3,1.4,0.5,1)] ${
                person.woman ? "shadow-[0_0_0_2px_#E8A0C0]" : ""
              }`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "scale(1)" : "scale(0.4)",
                transitionDelay: reduce ? "0ms" : `${i * 70}ms`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={person.src}
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-warm-white/65">
          Be among the first - gender mix updates as travelers reserve.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-8">
        <div>
          <p className="font-display text-[32px] font-medium tabular-nums leading-none text-warm-white">
            {totalBooked > 0 &&
            !genderMix.privacyMode &&
            genderMix.womenPct !== null ? (
              <>
                <em className="not-italic text-[#E8A0C0]">
                  {genderMix.womenPct}%
                </em>
              </>
            ) : totalBooked > 0 ? (
              <em className="not-italic text-[#E8A0C0]">-</em>
            ) : (
              <em className="not-italic text-[#E8A0C0]">-</em>
            )}
          </p>
          <p className="mt-1 text-[13px] text-warm-white/62">
            women on this batch
          </p>
        </div>
        {totalGuides > 0 ? (
          <div>
            <p className="font-display text-[32px] font-medium tabular-nums leading-none text-warm-white">
              {femaleGuides}
            </p>
            <p className="mt-1 text-[13px] text-warm-white/62">
              of {totalGuides} women trek leaders
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#E8A0C0]/30 bg-[#E8A0C0]/14 px-3.5 py-2 text-[13px] font-medium text-[#F0C4D8]"
          >
            ◆ {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
