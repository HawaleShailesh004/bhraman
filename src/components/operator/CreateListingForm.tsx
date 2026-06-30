"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type PlaceOption = { id: string; name: string; city: string };
type CategoryOption = { id: string; name: string };

const DIFFICULTIES = ["EASY", "MODERATE", "CHALLENGING", "EXTREME"] as const;

export function CreateListingForm({
  places,
  categories,
}: {
  places: PlaceOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [placeId, setPlaceId] = useState(places[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [difficulty, setDifficulty] =
    useState<(typeof DIFFICULTIES)[number]>("MODERATE");
  const [durationHours, setDurationHours] = useState(8);
  const [basePrice, setBasePrice] = useState(1299);
  const [minGroupSize, setMinGroupSize] = useState(2);
  const [maxGroupSize, setMaxGroupSize] = useState(12);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/operator/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          placeId,
          categoryId,
          difficulty,
          durationHours,
          basePrice,
          minGroupSize,
          maxGroupSize,
        }),
      });

      const data = (await response.json()) as { slug?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not create listing.");
      }

      pushToast({
        title: "Draft listing created",
        description: `Saved as ${data.slug}. Publish it when ready.`,
      });
      setTitle("");
      setSummary("");
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Create failed",
        description:
          error instanceof Error ? error.message : "Could not create listing.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl rounded-lg border border-line bg-white p-6 shadow-md"
    >
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold">Experience title</label>
        <input
          className="inp w-full"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Kalsubai Night Trek to Sunrise Summit"
          required
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold">Short summary</label>
        <input
          className="inp w-full"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="One punchy line travelers see first"
          required
        />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold">Place</label>
          <select
            className="inp w-full"
            value={placeId}
            onChange={(event) => setPlaceId(event.target.value)}
          >
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name} · {place.city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Category</label>
          <select
            className="inp w-full"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={[
                "rounded-full border px-4 py-2 text-sm font-semibold",
                difficulty === level
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white text-ink",
              ].join(" ")}
            >
              {level[0] + level.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold">Base price (₹)</label>
          <input
            type="number"
            className="inp w-full"
            value={basePrice}
            onChange={(event) => setBasePrice(Number(event.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Duration (hrs)</label>
          <input
            type="number"
            className="inp w-full"
            value={durationHours}
            onChange={(event) => setDurationHours(Number(event.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Min group</label>
          <input
            type="number"
            className="inp w-full"
            value={minGroupSize}
            onChange={(event) => setMinGroupSize(Number(event.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">Max group</label>
          <input
            type="number"
            className="inp w-full"
            value={maxGroupSize}
            onChange={(event) => setMaxGroupSize(Number(event.target.value))}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Saving..." : "Save as draft"}
      </Button>
    </form>
  );
}
