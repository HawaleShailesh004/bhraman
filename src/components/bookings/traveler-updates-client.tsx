"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { TravelerUpdateFeedItem } from "@/lib/traveler-updates";

export function TravelerUpdatesClient({
  initialItems,
}: {
  initialItems: TravelerUpdateFeedItem[];
}) {
  const [items, setItems] = useState(initialItems);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/bookings/updates", {
      cache: "no-store",
    });
    if (response.ok) {
      setItems((await response.json()) as TravelerUpdateFeedItem[]);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), 45_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <div className="page-shell pt-28 pb-24">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight">
          Trip updates
        </h1>
        <p className="mt-2 text-sm text-mist">
          Live notes from your operators - timing, pickup, weather, and urgent
          changes.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-12 text-center">
          <p className="text-sm text-mist">
            No updates yet. Book a trip to see operator posts here.
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-block text-sm font-bold text-amber-deep hover:underline"
          >
            Discover adventures
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-[16px] border bg-white p-5 ${
                item.isUnread ? "border-amber/50 shadow-sm" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-deep">
                  {item.update.type}
                  {item.slotStatus === "LIVE" ? " · LIVE" : ""}
                  {item.update.pinned ? " · pinned" : ""}
                </p>
                {item.isUnread ? (
                  <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-deep">
                    New
                  </span>
                ) : null}
              </div>
              <p className="mt-1 font-display text-lg font-medium text-ink">
                {item.update.title}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-body">
                {item.update.body}
              </p>
              <p className="mt-3 text-xs text-mist">
                {item.listingTitle} ·{" "}
                {new Date(item.departureAt).toLocaleString("en-IN")} ·{" "}
                {new Date(item.update.createdAt).toLocaleString("en-IN")}
              </p>
              <Link
                href={`/booking/${item.bookingRef}`}
                className="mt-3 inline-block text-sm font-bold text-forest hover:underline"
              >
                Open trip hub
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
