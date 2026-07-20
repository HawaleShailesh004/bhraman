"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Pattern 04 - Live activity ticker (platform pulse).
 * Hover pauses. prefers-reduced-motion → static first row.
 */
const EVENTS = [
  ["Priya booked", "Kalsubai Night Trek", "2 min ago"],
  ["3 seats left", "Sudhagad Fort Plateau", "Sat 25 Jul"],
  ["Weather: Go", "Devkund Waterfall Trek", "today"],
  ["6 women on batch", "Harishchandragad", "Sun 19 Jul"],
  ["Rahul booked", "Kundalika Rafting", "8 min ago"],
  ["Filling fast", "Kalavantin Durg", "Sat 25 Jul"],
  ["New verified operator", "Sahyadri Trails", "Pune"],
  ["Weather: Go", "Andharban Forest", "tomorrow"],
] as const;

function TickItems() {
  return (
    <>
      {EVENTS.map(([a, b, c]) => (
        <span
          key={`${a}-${b}-${c}`}
          className="inline-flex items-center gap-2.5 px-[30px] py-[18px] text-[14.5px] font-medium text-warm-white"
        >
          <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-amber" />
          <b className="font-bold">{a}</b>
          <span>· {b}</span>
          <span className="text-warm-white/35">·</span>
          <span>{c}</span>
        </span>
      ))}
    </>
  );
}

export function LiveTicker() {
  const reduce = useReducedMotion();

  return (
    <section
      className="overflow-hidden border-y border-warm-white/12 bg-forest"
      aria-label="Live activity"
    >
      <div
        className={`flex w-max whitespace-nowrap ${
          reduce ? "" : "animate-ticker hover:[animation-play-state:paused]"
        }`}
      >
        <div className="flex">
          <TickItems />
        </div>
        {!reduce ? (
          <div className="flex" aria-hidden>
            <TickItems />
          </div>
        ) : null}
      </div>
    </section>
  );
}
