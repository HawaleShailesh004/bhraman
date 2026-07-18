"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import type { AdventureMapPin } from "@/types/listing";
import { COPY } from "@/lib/marketing-copy";
import { brandEase } from "@/lib/motion";
import {
  DEFAULT_MAP_LOOK,
  MAP_LOOKS,
  type MapLookId,
} from "@/lib/map-looks";

const LOOK_STORAGE_KEY = "bhraman-map-look";

const AdventureMapCanvas = dynamic(
  () =>
    import("@/components/home/adventure-map-canvas").then(
      (m) => m.AdventureMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(62vh,520px)] min-h-[320px] items-center justify-center bg-paper-2">
        <p className="text-sm text-mist">Loading Maharashtra map…</p>
      </div>
    ),
  },
);

function isMapLookId(value: string): value is MapLookId {
  return MAP_LOOKS.some((look) => look.id === value);
}

export function MaharashtraMapSection({ pins }: { pins: AdventureMapPin[] }) {
  const reduce = useReducedMotion();
  const displayPins = useMemo(() => pins.slice(0, 24), [pins]);
  const [active, setActive] = useState<string | null>(
    displayPins[0]?.placeSlug ?? null,
  );
  const [lookId, setLookId] = useState<MapLookId | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOOK_STORAGE_KEY);
      setLookId(saved && isMapLookId(saved) ? saved : DEFAULT_MAP_LOOK);
    } catch {
      setLookId(DEFAULT_MAP_LOOK);
    }
  }, []);

  function chooseLook(next: MapLookId) {
    setLookId(next);
    try {
      localStorage.setItem(LOOK_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const activePin = useMemo(
    () => displayPins.find((p) => p.placeSlug === active) ?? displayPins[0] ?? null,
    [active, displayPins],
  );

  const resolvedLook = lookId ?? DEFAULT_MAP_LOOK;
  const captionTone =
    resolvedLook === "dark"
      ? "bg-ink/70 text-paper"
      : "bg-white/85 text-ink shadow-sm";

  return (
    <section id="destinations" className="section-y bg-paper-2">
      <div className="page-shell">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-deep">
            {COPY.map.eyebrow}
          </p>
          <h2 className="font-display text-[clamp(1.45rem,3.2vw,2rem)] font-bold tracking-tight text-ink">
            {COPY.map.title}
          </h2>
          <p className="mt-2 text-sm text-body">{COPY.map.sub}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
          <div className="relative overflow-hidden rounded-[22px] border border-line bg-white shadow-[var(--shadow-lg)]">
            {lookId ? (
              <AdventureMapCanvas
                pins={displayPins}
                activeSlug={activePin?.placeSlug ?? null}
                onSelect={setActive}
                lookId={lookId}
              />
            ) : (
              <div className="flex h-[min(62vh,520px)] min-h-[320px] items-center justify-center bg-paper-2">
                <p className="text-sm text-mist">Loading Maharashtra map…</p>
              </div>
            )}
            <p
              className={`pointer-events-none absolute bottom-8 left-2.5 max-w-[65%] truncate rounded-full px-2.5 py-1 text-[10px] backdrop-blur-sm ${captionTone}`}
            >
              Tap a pin · {displayPins.length} places
            </p>
            <div
              role="radiogroup"
              aria-label="Map appearance"
              className="absolute bottom-2 left-2.5 z-10 flex gap-1 rounded-md bg-white/60 px-1.5 py-0.5 backdrop-blur-sm"
            >
              {MAP_LOOKS.map((look) => {
                const selected = look.id === resolvedLook;
                return (
                  <button
                    key={look.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseLook(look.id)}
                    className={`px-1 py-0.5 text-[9px] font-medium tracking-wide transition-colors ${
                      selected
                        ? "text-ink"
                        : "text-mist/80 hover:text-mist"
                    }`}
                  >
                    {look.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activePin ? (
                <motion.div
                  key={activePin.placeSlug}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.25, ease: brandEase }
                  }
                  className="rounded-[18px] border border-line bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6"
                >
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mist">
                    <MapPin size={13} /> {activePin.district}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-ink">
                    {activePin.placeName}
                  </h3>
                  <p className="mt-2 text-sm text-body">
                    {activePin.listingCount} bookable trip
                    {activePin.listingCount === 1 ? "" : "s"} · including{" "}
                    <span className="font-semibold text-ink">
                      {activePin.sampleTitle}
                    </span>
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/listings/${activePin.sampleSlug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber px-4 py-2.5 text-sm font-bold text-amber-text"
                    >
                      View trip <ArrowRight size={15} />
                    </Link>
                    <Link
                      href={`/discover?city=${encodeURIComponent(activePin.district)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink"
                    >
                      More nearby
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto pr-1">
              {displayPins.slice(0, 10).map((pin) => (
                <li key={pin.placeSlug}>
                  <button
                    type="button"
                    onClick={() => setActive(pin.placeSlug)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      pin.placeSlug === activePin?.placeSlug
                        ? "bg-white font-semibold text-ink shadow-sm"
                        : "text-body hover:bg-white/70"
                    }`}
                  >
                    <span className="truncate">{pin.placeName}</span>
                    <span className="shrink-0 text-xs text-mist">
                      {pin.listingCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
