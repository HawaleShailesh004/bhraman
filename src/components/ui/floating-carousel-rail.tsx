"use client";

import type { ReactNode, Ref } from "react";
import { CarouselNavButton } from "@/components/ui/carousel-nav-button";

/**
 * Card track matches page-shell content width (same as section headings).
 * Nav arrows float in the margin *outside* that shell - never inset the cards.
 */
export function FloatingCarouselRail({
  scrollRef,
  canLeft,
  canRight,
  onScroll,
  children,
  className = "",
}: {
  scrollRef: Ref<HTMLDivElement>;
  canLeft: boolean;
  canRight: boolean;
  onScroll: (dir: -1 | 1) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[min(100%,calc(72rem+8rem))] ${className}`}
    >
      <CarouselNavButton
        side="left"
        disabled={!canLeft}
        onClick={() => onScroll(-1)}
        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 xl:grid"
      />
      <CarouselNavButton
        side="right"
        disabled={!canRight}
        onClick={() => onScroll(1)}
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 xl:grid"
      />

      {/* Same width + padding as .page-shell - cards flush with headings */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex w-full min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 pt-1 scrollbar-hide"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
