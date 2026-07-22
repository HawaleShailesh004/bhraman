"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Mountain,
  Calendar,
  Users,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

export type SortOption = "recommended" | "price-low" | "price-high";

export function SearchBarUi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "All Maharashtra");
  const [groupSize, setGroupSize] = useState(searchParams.get("group") ?? "2 people");
  const [date, setDate] = useState(searchParams.get("date") ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    if (city && city !== "All Maharashtra") params.set("city", city);
    else params.delete("city");
    params.set("group", groupSize);
    if (date) params.set("date", date);
    else params.delete("date");
    params.delete("page");
    router.push(`/discover?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex items-center gap-2 rounded-[20px] border border-line/80 bg-white px-4 py-3 shadow-[var(--shadow-sm)]">
        <Search size={18} className="shrink-0 text-mist" strokeWidth={2.2} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search treks, rafting, Kolad, operator names…"
          className="w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-mist"
          aria-label="Search adventures"
        />
      </div>

      <div className="max-md:hidden flex flex-col items-stretch rounded-[20px] border border-line/80 bg-white p-1.5 shadow-[var(--shadow-sm)] sm:flex-row">
      <div className="flex-1 px-4 py-2.5 sm:border-r sm:border-line/80">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist">
          Where
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <MapPin size={14} className="text-mist" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border-none bg-transparent outline-none"
          />
        </div>
      </div>
      <div className="flex-1 px-4 py-2.5 sm:border-r sm:border-line/80">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist">
          Activity
        </div>
        <div className="flex items-center gap-2 text-sm text-[#A9B3AB]">
          <Mountain size={14} /> Use chips below
        </div>
      </div>
      <div className="flex-1 px-4 py-2.5 sm:border-r sm:border-line/80">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist">
          When
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar size={14} className="text-mist" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border-none bg-transparent outline-none text-ink"
          />
        </div>
      </div>
      <div className="flex-1 px-4 py-2.5">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist">
          Group
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <Users size={14} className="text-mist" />
          <input
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            className="w-full border-none bg-transparent outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        className="m-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber shadow-[0_4px_12px_rgba(224,138,43,0.28)] transition-transform hover:scale-[1.03]"
        aria-label="Search"
      >
        <Search size={18} className="text-[#3A2406]" strokeWidth={2.4} />
      </button>
      </div>
    </form>
  );
}

export function DiscoverMobileFiltersSheet({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSort,
}: {
  categories: { slug: string; name: string; icon: string | null }[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  sort: SortOption;
  onSort: (s: SortOption) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(searchParams.get("city") ?? "All Maharashtra");
  const [groupSize, setGroupSize] = useState(searchParams.get("group") ?? "2 people");
  const [date, setDate] = useState(searchParams.get("date") ?? "");

  useEffect(() => {
    if (!open) return;
    setCity(searchParams.get("city") ?? "All Maharashtra");
    setGroupSize(searchParams.get("group") ?? "2 people");
    setDate(searchParams.get("date") ?? "");
  }, [open, searchParams]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function applyFilters(event?: FormEvent) {
    event?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (city && city !== "All Maharashtra") params.set("city", city);
    else params.delete("city");
    params.set("group", groupSize);
    if (date) params.set("date", date);
    else params.delete("date");
    params.delete("page");
    router.push(`/discover?${params.toString()}`);
    setOpen(false);
  }

  const chips = [
    { slug: "all", name: "All" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink max-md:inline-flex md:hidden"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] max-md:block md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Discover filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-[22px] border border-line bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line text-mist"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={applyFilters} className="space-y-5">
                <label className="block text-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-mist">
                    Where
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-[12px] border border-line px-3 py-2.5">
                    <MapPin size={14} className="shrink-0 text-mist" />
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border-none bg-transparent outline-none"
                    />
                  </div>
                </label>

                <label className="block text-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-mist">
                    When
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-[12px] border border-line px-3 py-2.5">
                    <Calendar size={14} className="shrink-0 text-mist" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-none bg-transparent outline-none"
                    />
                  </div>
                </label>

                <label className="block text-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-mist">
                    Group
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-[12px] border border-line px-3 py-2.5">
                    <Users size={14} className="shrink-0 text-mist" />
                    <input
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      className="w-full border-none bg-transparent outline-none"
                    />
                  </div>
                </label>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-mist">
                    Activity
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {chips.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => onCategoryChange(c.slug)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium ${
                          activeCategory === c.slug
                            ? "border-ink bg-ink text-paper"
                            : "border-line bg-white text-ink"
                        }`}
                      >
                        {c.slug !== "all" ? (
                          <CategoryIcon
                            slug={c.slug}
                            size={12}
                            className={
                              activeCategory === c.slug ? "text-paper" : "text-forest"
                            }
                          />
                        ) : null}
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-mist">
                    Sort
                  </p>
                  <div className="mt-2 grid gap-1">
                    {(
                      [
                        ["recommended", "Recommended"],
                        ["price-low", "Price: low to high"],
                        ["price-high", "Price: high to low"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onSort(value)}
                        className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
                          sort === value
                            ? "bg-amber/15 font-bold text-amber-deep"
                            : "hover:bg-paper-2"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="touch-target w-full rounded-full bg-amber py-3 text-sm font-bold text-amber-text"
                >
                  Apply filters
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function HorizontalScrollRow({
  children,
  itemCount,
}: {
  children: ReactNode;
  itemCount: number;
}) {
  const { ref, canLeft, canRight, scrollByDir } = useHorizontalScroll(320, [
    itemCount,
  ]);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <CarouselNavButton
        side="left"
        disabled={!canLeft}
        onClick={() => scrollByDir(-1)}
        className="!h-9 !w-9"
      />

      <div
        ref={ref}
        className="scrollbar-hide flex min-w-0 flex-1 gap-2.5 overflow-x-auto scroll-smooth"
      >
        {children}
      </div>

      <CarouselNavButton
        side="right"
        disabled={!canRight}
        onClick={() => scrollByDir(1)}
        className="!h-9 !w-9"
      />
    </div>
  );
}

export function FilterChips({
  categories,
  active,
  onChange,
}: {
  categories: { slug: string; name: string; icon: string | null }[];
  active: string;
  onChange: (slug: string) => void;
}) {
  const chips = [
    { slug: "all", name: "All" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <HorizontalScrollRow itemCount={chips.length}>
      {chips.map((c) => (
        <button
          key={c.slug}
          type="button"
          onClick={() => onChange(c.slug)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
            active === c.slug
              ? "border-ink bg-ink text-paper"
              : "border-line bg-white text-ink hover:border-mist"
          }`}
        >
          {c.slug !== "all" ? (
            <CategoryIcon
              slug={c.slug}
              size={12}
              className={active === c.slug ? "text-paper" : "text-forest"}
            />
          ) : null}
          {c.name}
        </button>
      ))}
    </HorizontalScrollRow>
  );
}

export function FilterSortBar({
  count,
  sort,
  onSort,
}: {
  count: number;
  sort: SortOption;
  onSort: (s: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-mist">
        <span className="font-semibold text-ink">{count}</span> experiences found
      </p>
      <div className="relative max-md:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-medium hover:border-mist"
        >
          <SlidersHorizontal size={15} /> Sort:{" "}
          {sort === "recommended"
            ? "Recommended"
            : sort === "price-low"
              ? "Price ↑"
              : "Price ↓"}
        </button>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lg)]"
          >
            {(
              [
                ["recommended", "Recommended"],
                ["price-low", "Price: low to high"],
                ["price-high", "Price: high to low"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  onSort(v);
                  setOpen(false);
                }}
                className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-paper-2 ${
                  sort === v ? "font-bold text-amber-deep" : ""
                }`}
              >
                {l}
              </button>
            ))}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
