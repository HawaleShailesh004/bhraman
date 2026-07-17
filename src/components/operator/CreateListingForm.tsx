"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { MapPin, Mountain, Ruler, Tag, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

type PlaceOption = { id: string; name: string; city: string };
type CategoryOption = { id: string; name: string };

const DIFFICULTIES = ["EASY", "MODERATE", "CHALLENGING", "EXTREME"] as const;

export function CreateListingForm({
  places,
  categories,
  onCreated,
}: {
  places: PlaceOption[];
  categories: CategoryOption[];
  onCreated?: () => void;
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
      onCreated?.();
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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <FormSection
        icon={<Tag size={16} />}
        title="Basics"
        hint="What travelers see first in search and cards."
      >
        <Field label="Experience title">
          <input
            className="inp w-full"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Kalsubai Night Trek to Sunrise Summit"
            required
          />
        </Field>
        <Field label="Short summary">
          <input
            className="inp w-full"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="One punchy line travelers see first"
            required
          />
        </Field>
      </FormSection>

      <FormSection
        icon={<MapPin size={16} />}
        title="Location & category"
        hint="Where it runs and how it is classified."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Place">
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
          </Field>
          <Field label="Category">
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
          </Field>
        </div>
        <Field label="Difficulty">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  difficulty === level
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-ink hover:border-mist",
                ].join(" ")}
              >
                {level[0] + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </Field>
      </FormSection>

      <FormSection
        icon={<Ruler size={16} />}
        title="Trip details"
        hint="Duration and group capacity for this experience."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Duration (hrs)">
            <input
              type="number"
              className="inp w-full"
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              min={1}
              required
            />
          </Field>
          <Field label="Min group">
            <div className="relative">
              <Users
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist"
              />
              <input
                type="number"
                className="inp w-full pl-9"
                value={minGroupSize}
                onChange={(event) =>
                  setMinGroupSize(Number(event.target.value))
                }
                min={1}
                required
              />
            </div>
          </Field>
          <Field label="Max group">
            <div className="relative">
              <Users
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist"
              />
              <input
                type="number"
                className="inp w-full pl-9"
                value={maxGroupSize}
                onChange={(event) =>
                  setMaxGroupSize(Number(event.target.value))
                }
                min={1}
                required
              />
            </div>
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<Wallet size={16} />}
        title="Pricing"
        hint="Base price per person before add-ons."
      >
        <Field label="Base price (₹)">
          <div className="relative max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-mist">
              ₹
            </span>
            <input
              type="number"
              className="inp w-full pl-8"
              value={basePrice}
              onChange={(event) => setBasePrice(Number(event.target.value))}
              min={0}
              required
            />
          </div>
        </Field>
      </FormSection>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-[14px] border border-line/80 bg-white/95 p-4 shadow-[var(--shadow-md)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-mist sm:max-w-sm">
          <Mountain size={14} className="mt-0.5 shrink-0 text-forest" />
          Saves as a draft. Toggle publish from My listings when you are ready.
        </p>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full shrink-0 sm:w-auto"
        >
          {submitting ? "Saving..." : "Save as draft"}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-line/80 bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <header className="mb-5 flex gap-3 border-b border-line/70 pb-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EAF1EC] text-forest">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-base font-bold tracking-tight">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-mist">{hint}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      {children}
    </div>
  );
}
