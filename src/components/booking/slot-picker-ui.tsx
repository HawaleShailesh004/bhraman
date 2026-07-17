"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock3 } from "lucide-react";
import type { AvailabilitySlotData } from "@/types/listing";
import { brandEase, softSpring, springTap } from "@/lib/motion";

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatWeekday(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(
    new Date(iso),
  );
}

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric" }).format(
    new Date(iso),
  );
}

function formatMonth(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(
    new Date(iso),
  );
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatSelectedSummary(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function seatTone(slot: AvailabilitySlotData) {
  if (slot.status === "FULL" || slot.seatsLeft <= 0) {
    return { label: "Full", className: "text-clay" };
  }
  if (slot.status === "FILLING_FAST" || slot.seatsLeft <= 3) {
    return {
      label: `${slot.seatsLeft} left`,
      className: "text-amber-deep",
    };
  }
  if (slot.status === "CONFIRMED") {
    return { label: "Confirmed", className: "text-forest" };
  }
  return {
    label: `${slot.seatsLeft} seats`,
    className: "text-mist",
  };
}

export function SlotPickerUi({
  slots,
  loading,
  selectedSlotId,
  onSelect,
}: {
  slots: AvailabilitySlotData[];
  loading?: boolean;
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}) {
  const reduce = useReducedMotion();

  const days = useMemo(() => {
    const map = new Map<
      string,
      { key: string; sampleIso: string; slots: AvailabilitySlotData[] }
    >();
    for (const slot of slots) {
      const key = dateKey(slot.startTime);
      const existing = map.get(key);
      if (existing) {
        existing.slots.push(slot);
      } else {
        map.set(key, { key, sampleIso: slot.startTime, slots: [slot] });
      }
    }
    return Array.from(map.values());
  }, [slots]);

  const selectedSlot =
    slots.find((slot) => slot.id === selectedSlotId) ?? null;

  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);

  const resolvedDayKey =
    activeDayKey && days.some((d) => d.key === activeDayKey)
      ? activeDayKey
      : selectedSlot
        ? dateKey(selectedSlot.startTime)
        : (days[0]?.key ?? null);

  const daySlots =
    days.find((day) => day.key === resolvedDayKey)?.slots ?? [];

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading dates">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[4.5rem] w-[4.25rem] shrink-0 rounded-2xl skeleton-shimmer"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-line bg-paper-2/60 px-4 py-5">
        <CalendarDays size={18} className="mt-0.5 shrink-0 text-mist" />
        <div>
          <p className="text-sm font-semibold text-ink">No open dates yet</p>
          <p className="mt-1 text-xs leading-relaxed text-mist">
            The operator has not published upcoming departures for this trip.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-mist">
            Choose a date
          </p>
          <p className="text-[11px] text-mist">
            {days.length} day{days.length === 1 ? "" : "s"} open
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Departure date"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {days.map((day) => {
            const selected = day.key === resolvedDayKey;
            const openCount = day.slots.filter((s) => s.seatsLeft > 0).length;
            return (
              <motion.button
                key={day.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setActiveDayKey(day.key);
                  const prefer =
                    day.slots.find((s) => s.id === selectedSlotId) ??
                    day.slots.find((s) => s.seatsLeft > 0) ??
                    day.slots[0];
                  if (prefer) onSelect(prefer.id);
                }}
                whileTap={reduce ? undefined : { scale: 0.96 }}
                transition={springTap}
                className={`relative flex w-[4.35rem] shrink-0 flex-col items-center rounded-2xl border-[1.5px] px-2 py-2.5 text-center transition-colors duration-200 ${
                  selected
                    ? "border-amber bg-[#FFF9F0] shadow-[0_6px_16px_rgba(224,138,43,0.18)]"
                    : "border-line bg-white hover:border-mist"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    selected ? "text-amber-deep" : "text-mist"
                  }`}
                >
                  {formatWeekday(day.sampleIso)}
                </span>
                <span className="mt-0.5 font-display text-xl font-extrabold leading-none tracking-tight">
                  {formatDay(day.sampleIso)}
                </span>
                <span
                  className={`mt-1 text-[10px] font-semibold ${
                    selected ? "text-ink" : "text-mist"
                  }`}
                >
                  {formatMonth(day.sampleIso)}
                </span>
                {openCount === 0 ? (
                  <span className="mt-1 text-[9px] font-bold text-clay">
                    Full
                  </span>
                ) : null}
                {selected ? (
                  <motion.span
                    layoutId={reduce ? undefined : "slot-day-indicator"}
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-amber"
                    transition={softSpring}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Clock3 size={13} className="text-mist" />
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-mist">
            Departure time
          </p>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedDayKey ?? "none"}
            role="radiogroup"
            aria-label="Departure time"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.22, ease: brandEase }
            }
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {daySlots.map((slot) => {
              const selected = slot.id === selectedSlotId;
              const full = slot.seatsLeft <= 0 || slot.status === "FULL";
              const tone = seatTone(slot);
              return (
                <motion.button
                  key={slot.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={full}
                  onClick={() => onSelect(slot.id)}
                  whileTap={
                    reduce || full ? undefined : { scale: 0.98 }
                  }
                  transition={springTap}
                  className={`relative rounded-xl border-[1.5px] px-3 py-3 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${
                    selected
                      ? "border-amber bg-[#FFF9F0]"
                      : "border-line bg-white hover:border-mist"
                  }`}
                >
                  <span className="block font-display text-base font-bold tracking-tight">
                    {formatTime(slot.startTime)}
                  </span>
                  <span
                    className={`mt-1 block text-[11px] font-semibold ${tone.className}`}
                  >
                    {tone.label}
                  </span>
                  {selected ? (
                    <motion.span
                      layoutId={reduce ? undefined : "slot-time-check"}
                      className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber"
                      transition={softSpring}
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {selectedSlot ? (
        <motion.p
          key={selectedSlot.id}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-paper-2 px-3 py-2 text-xs font-medium text-[#54635A]"
        >
          Selected · {formatSelectedSummary(selectedSlot.startTime)}
        </motion.p>
      ) : null}
    </div>
  );
}
