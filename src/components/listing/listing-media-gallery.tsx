"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ListingDetailData } from "@/types/listing";
import { listingImageStyle } from "@/lib/ui-present";
import { Eyebrow } from "@/components/ui/primitives";

function galleryPhotos(listing: ListingDetailData): string[] {
  const hero = listing.heroImageUrl;
  return (listing.galleryUrls ?? []).filter(
    (url) => url && url !== hero,
  );
}

export function ListingGalleryStrip({ listing }: { listing: ListingDetailData }) {
  const photos = galleryPhotos(listing);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [photos, updateScrollState]);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.75, 280);
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? null : Math.max(0, i - 1)));
      if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i === null ? null : Math.min(photos.length - 1, i + 1),
        );
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, photos.length]);

  if (photos.length === 0) return null;

  const showArrows = photos.length > 1;

  return (
    <section className="relative min-w-0 overflow-x-clip">
      <Eyebrow>Gallery</Eyebrow>
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="min-w-0 break-words font-display text-xl sm:text-2xl">
          Photos from the experience
        </h2>
        <span className="shrink-0 text-sm text-mist">
          {photos.length} photos
        </span>
      </div>

      <div className="group/gallery relative min-w-0">
        {showArrows && canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollBy("left")}
            className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-[var(--shadow-md)] transition-colors hover:border-forest hover:text-forest sm:grid"
            aria-label="Scroll photos left"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        ) : null}

        {showArrows && canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollBy("right")}
            className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-[var(--shadow-md)] transition-colors hover:border-forest hover:text-forest sm:grid"
            aria-label="Scroll photos right"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        ) : null}

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-[4/3] w-[min(78vw,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-sm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest sm:w-[min(72vw,320px)]"
              style={listingImageStyle(listing.category.slug, url)}
              aria-label={`View photo ${i + 1} of ${photos.length}`}
            >
              <div className="absolute inset-0 bg-forest/0 transition-colors duration-300 group-hover:bg-forest/10" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/92 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Photo gallery"
          >
            <div className="flex items-center justify-between px-5 py-4 text-paper/90 text-sm shrink-0">
              <span>
                {lightboxIndex + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-14">
              <img
                src={photos[lightboxIndex]}
                alt={`${listing.title} — photo ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg"
              />

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))
                    }
                    disabled={lightboxIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-paper grid place-items-center"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        Math.min(photos.length - 1, (i ?? 0) + 1),
                      )
                    }
                    disabled={lightboxIndex === photos.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-paper grid place-items-center"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
