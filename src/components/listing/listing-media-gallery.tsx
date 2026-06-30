"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { ListingDetailData } from "@/types/listing";
import { listingImageStyle } from "@/lib/ui-present";

function listingPhotos(listing: ListingDetailData): string[] {
  return [
    ...(listing.heroImageUrl ? [listing.heroImageUrl] : []),
    ...(listing.galleryUrls ?? []),
  ].filter((url, index, all) => url && all.indexOf(url) === index);
}

type ListingMediaGalleryProps = {
  listing: ListingDetailData;
  children?: ReactNode;
};

export function ListingMediaGallery({ listing, children }: ListingMediaGalleryProps) {
  const photos = useMemo(() => listingPhotos(listing), [listing]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, goPrev, goNext]);

  const fallbackStyle = listingImageStyle(listing.category.slug, null);
  const sidePhotos = photos.slice(1, 3);
  const hasMosaic = photos.length >= 2;

  return (
    <>
      <div className="relative bg-ink">
        {/* Desktop mosaic */}
        <div
          className={`hidden lg:grid gap-1.5 max-w-[1440px] mx-auto ${
            hasMosaic ? "grid-cols-[1.2fr_0.8fr] h-[min(58vh,540px)] min-h-[420px]" : "h-[68vh] min-h-[480px]"
          }`}
        >
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="relative h-full w-full overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2"
            style={listingImageStyle(listing.category.slug, photos[0])}
            aria-label={`${listing.title} — main photo`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>

          {hasMosaic ? (
            <div className={`grid gap-1.5 h-full ${sidePhotos.length === 1 ? "grid-rows-1" : "grid-rows-2"}`}>
              {sidePhotos.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => openLightbox(i + 1)}
                  className="relative h-full w-full overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                  style={listingImageStyle(listing.category.slug, url)}
                  aria-label={`${listing.title} — photo ${i + 2}`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                  {i === sidePhotos.length - 1 && photos.length > 3 ? (
                    <span className="absolute inset-0 grid place-items-center bg-black/45 text-paper font-semibold text-sm backdrop-blur-[2px]">
                      +{photos.length - 3} more
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden relative h-[62vh] min-h-[400px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={photos[activeIndex] ?? "fallback"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
              style={
                photos[activeIndex]
                  ? listingImageStyle(listing.category.slug, photos[activeIndex])
                  : fallbackStyle
              }
              onClick={() => photos.length > 0 && openLightbox(activeIndex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && photos.length > 0 && openLightbox(activeIndex)}
              aria-label="Open photo gallery"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
            </motion.div>
          </AnimatePresence>

          {photos.length > 1 ? (
            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              className="absolute top-4 right-4 z-20 lg:hidden inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-semibold text-paper backdrop-blur"
            >
              <Images size={12} />
              {photos.length} photos
            </button>
          ) : null}

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md grid place-items-center text-ink"
                aria-label="Previous photo"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md grid place-items-center text-ink"
                aria-label="Next photo"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === activeIndex ? "w-6 bg-paper" : "w-1.5 bg-paper/50"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === activeIndex}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {children}

        {photos.length > 1 ? (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute top-5 right-5 z-20 hidden lg:inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-[var(--shadow-md)] backdrop-blur hover:bg-white transition-colors"
          >
            <Images size={16} />
            Show all {photos.length} photos
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {lightboxOpen && photos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/92 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`${listing.title} photos`}
          >
            <div className="flex items-center justify-between px-5 py-4 text-paper/90 text-sm shrink-0">
              <span>
                {activeIndex + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
                aria-label="Close gallery"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={photos[activeIndex]}
                  src={photos[activeIndex]}
                  alt={`${listing.title} — photo ${activeIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                />
              </AnimatePresence>

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-paper grid place-items-center"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-paper grid place-items-center"
                    aria-label="Next"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              ) : null}
            </div>

            {photos.length > 1 ? (
              <div className="shrink-0 px-4 pb-5 flex gap-2 overflow-x-auto justify-center">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeIndex ? "border-amber scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={listingImageStyle(listing.category.slug, url)}
                    aria-label={`View photo ${i + 1}`}
                    aria-current={i === activeIndex}
                  />
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}