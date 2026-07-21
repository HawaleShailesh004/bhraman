"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZES = [5, 10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export function useClientPagination<T>(
  items: T[],
  initialPageSize: PageSize = 10,
  resetKey?: string | number,
) {
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [pageSize, resetKey, total]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, total);

  function changePageSize(size: PageSize) {
    setPageSize(size);
    setPage(1);
  }

  return {
    pageItems,
    page: safePage,
    pageSize,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    setPage,
    changePageSize,
  };
}

export function PaginationControls({
  total,
  page,
  pageSize,
  totalPages,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
  className = "",
}: {
  total: number;
  page: number;
  pageSize: PageSize;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
  className?: string;
}) {
  if (total === 0) return null;

  return (
    <>
      {/* Keeps page content clear of the floating bar */}
      <div className="h-28 shrink-0 md:h-24" aria-hidden />

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 ${className}`}
      >
        <nav
          aria-label="Pagination"
          className="pointer-events-auto flex w-full max-w-lg flex-col items-center gap-2.5 rounded-2xl border border-line/90 bg-white/95 px-3 py-3 shadow-[0_12px_40px_rgba(26,46,34,0.16)] backdrop-blur-md sm:max-w-none sm:flex-row sm:gap-4 sm:rounded-full sm:px-5 sm:py-2.5"
        >
          <p className="whitespace-nowrap text-xs text-mist sm:text-sm">
            <span className="font-semibold text-ink">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of {total}
          </p>

          <div
            className="hidden h-4 w-px bg-line sm:block"
            aria-hidden
          />

          <div className="flex items-center gap-1.5">
            <span className="hidden text-xs font-medium text-mist sm:inline sm:mr-1">
              Per page
            </span>
            <div className="hidden gap-1 rounded-full border border-line bg-paper-2 p-1 sm:flex">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`min-w-8 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    pageSize === size
                      ? "bg-ink text-paper"
                      : "text-ink hover:bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {totalPages > 1 ? (
            <>
              <div
                className="hidden h-4 w-px bg-line sm:block"
                aria-hidden
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  className="touch-target inline-flex min-h-[44px] items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold transition-colors hover:border-mist disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="min-w-[3.5rem] text-center text-xs font-medium text-mist">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  className="touch-target inline-flex min-h-[44px] items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold transition-colors hover:border-mist disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </>
          ) : null}
        </nav>
      </div>
    </>
  );
}
