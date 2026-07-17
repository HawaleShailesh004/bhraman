"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { CreateListingForm } from "@/components/operator/CreateListingForm";
import { OperatorListingManagerUi } from "@/components/operator/operator-dashboard-ui";
import {
  PaginationControls,
  useClientPagination,
} from "@/components/ui/pagination";
import { brandEase } from "@/lib/motion";
import type { OperatorListingRow } from "@/types/operator";

type Tab = "listings" | "create";

type PlaceOption = { id: string; name: string; city: string };
type CategoryOption = { id: string; name: string };

export function OperatorListingsClient({
  listings,
  places,
  categories,
  initialTab = "listings",
}: {
  listings: OperatorListingRow[];
  places: PlaceOption[];
  categories: CategoryOption[];
  initialTab?: Tab;
}) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>(
    initialTab === "create" ? "create" : "listings",
  );
  const pagination = useClientPagination(listings, 10);

  function goTab(next: Tab) {
    setTab(next);
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Listings sections"
        className="mb-6 flex flex-wrap gap-2 rounded-[14px] border border-line/80 bg-white p-1.5 shadow-[var(--shadow-sm)]"
      >
        <TabButton
          active={tab === "listings"}
          onClick={() => goTab("listings")}
          label="My listings"
          count={listings.length}
        />
        <TabButton
          active={tab === "create"}
          onClick={() => goTab("create")}
          label="Create listing"
          icon
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "listings" ? (
          <motion.div
            key="listings"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: brandEase }}
          >
            {listings.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-line bg-white p-12 text-center">
                <h4 className="font-display text-lg">No listings yet</h4>
                <p className="mt-2 text-sm text-mist">
                  Publish your first experience from the Create tab.
                </p>
                <button
                  type="button"
                  onClick={() => goTab("create")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-[#3A2406] transition-transform hover:-translate-y-0.5"
                >
                  <Plus size={16} /> Create listing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <OperatorListingManagerUi listings={pagination.pageItems} />
                <PaginationControls
                  total={pagination.total}
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalPages={pagination.totalPages}
                  rangeStart={pagination.rangeStart}
                  rangeEnd={pagination.rangeEnd}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.changePageSize}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: brandEase }}
          >
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Create a new experience
              </h2>
              <p className="mt-1 text-sm text-mist">
                Fill each group below. You can publish from My listings once the
                draft is ready.
              </p>
            </div>
            <CreateListingForm
              places={places}
              categories={categories}
              onCreated={() => goTab("listings")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
        active
          ? "bg-ink text-paper shadow-sm"
          : "text-ink hover:bg-paper-2"
      }`}
    >
      {icon ? <Plus size={15} /> : null}
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-white/20 text-paper" : "bg-paper-2 text-mist"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
