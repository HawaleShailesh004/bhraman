"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type ListingOption = {
  id: string;
  title: string;
  durationHours: number;
  maxGroupSize: number;
  status: string;
};

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 6, label: "Sat" },
  { value: 5, label: "Fri" },
];

export function AvailabilityForm({ listings }: { listings: ListingOption[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [listingId, setListingId] = useState(listings[0]?.id ?? "");
  const [weekdays, setWeekdays] = useState<number[]>([0, 6]);
  const [startTime, setStartTime] = useState("06:00");
  const [capacity, setCapacity] = useState(12);
  const [minSeatsToConfirm, setMinSeatsToConfirm] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);

  function toggleWeekday(day: number) {
    setWeekdays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!listingId) {
      pushToast({
        tone: "err",
        title: "Select a listing",
        description: "Choose a listing before generating slots.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/operator/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          weekdays,
          startTime,
          capacity,
          fromDate,
          toDate,
          minSeatsToConfirm: minSeatsToConfirm
            ? Number.parseInt(minSeatsToConfirm, 10)
            : undefined,
        }),
      });

      const data = (await response.json()) as { created?: number; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not generate slots.");
      }

      pushToast({
        title: "Slots generated",
        description: `Created ${data.created ?? 0} new availability slots.`,
      });
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Could not generate slots.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (listings.length === 0) {
    return (
      <div className="state-empty max-w-full">
        <h3 className="font-display text-xl font-extrabold">No listings to schedule</h3>
        <p className="mt-2 text-sm text-body-muted">
          Create a listing first, then generate recurring availability here.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl rounded-lg border border-line bg-white p-4 shadow-md sm:p-6"
    >
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold">Listing</label>
        <select
          value={listingId}
          onChange={(event) => setListingId(event.target.value)}
          className="inp w-full"
        >
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold">Repeat on</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleWeekday(day.value)}
              className={[
                "touch-target min-h-[44px] rounded-full border px-4 py-2 text-sm font-semibold",
                weekdays.includes(day.value)
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white text-ink",
              ].join(" ")}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold">Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="inp w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Capacity</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
            className="inp w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">
            Min seats to confirm
          </label>
          <input
            type="number"
            min={1}
            max={capacity}
            value={minSeatsToConfirm}
            onChange={(event) => setMinSeatsToConfirm(event.target.value)}
            className="inp w-full"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="inp w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Until</label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="inp w-full"
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Generating..." : "Generate recurring slots"}
      </Button>
    </form>
  );
}
