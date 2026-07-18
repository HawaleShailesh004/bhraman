"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AdventureMapPin } from "@/types/listing";
import { DEFAULT_MAP_LOOK, lookById, type MapLookId } from "@/lib/map-looks";

export type { MapLookId };
export { DEFAULT_MAP_LOOK, MAP_LOOKS } from "@/lib/map-looks";

/** Southwest → Northeast of Maharashtra */
const MH_BOUNDS: [[number, number], [number, number]] = [
  [72.55, 15.6],
  [80.9, 22.1],
];

const MH_CENTER: [number, number] = [75.7, 19.0];

function createPinElement(selected: boolean, pinTheme: "light" | "dark") {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "bhraman-map-pin";
  el.style.cssText = [
    "width:18px",
    "height:18px",
    "padding:0",
    "border:0",
    "border-radius:999px",
    "cursor:pointer",
    "display:grid",
    "place-items:center",
    "background:transparent",
  ].join(";");

  const idle =
    pinTheme === "dark"
      ? "background:#FAF8F3;border:1.5px solid rgba(224,138,43,0.9);box-shadow:0 0 0 3px rgba(224,138,43,0.28)"
      : "background:#2D5A3D;border:2px solid #FAF8F3;box-shadow:0 0 0 3px rgba(45,90,61,0.25),0 2px 6px rgba(26,46,34,0.3)";

  const active =
    "background:#E08A2B;width:14px;height:14px;border:2px solid #FAF8F3;box-shadow:0 0 0 5px rgba(224,138,43,0.4),0 2px 8px rgba(26,46,34,0.35)";

  const dot = document.createElement("span");
  dot.style.cssText = [
    "display:block",
    "width:12px",
    "height:12px",
    "border-radius:999px",
    selected ? active : idle,
    "transition:transform 150ms ease",
  ].join(";");
  el.appendChild(dot);
  return el;
}

export function AdventureMapCanvas({
  pins,
  activeSlug,
  onSelect,
  lookId = DEFAULT_MAP_LOOK,
}: {
  pins: AdventureMapPin[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  lookId?: MapLookId;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<globalThis.Map<string, Marker>>(
    new globalThis.Map(),
  );
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const lookRef = useRef(lookById(lookId));
  lookRef.current = lookById(lookId);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const activeSlugRef = useRef(activeSlug);
  activeSlugRef.current = activeSlug;
  const initialLookId = useRef(lookId);

  function syncMarkers(map: MapLibreMap) {
    const existing = markersRef.current;
    const currentPins = pinsRef.current;
    const currentActive = activeSlugRef.current;
    const pinTheme = lookRef.current.pinTheme;
    const nextSlugs = new Set(currentPins.map((p) => p.placeSlug));

    existing.forEach((marker, slug) => {
      if (!nextSlugs.has(slug)) {
        marker.remove();
        existing.delete(slug);
      }
    });

    for (const pin of currentPins) {
      const selected = pin.placeSlug === currentActive;
      const prev = existing.get(pin.placeSlug);
      if (prev) {
        prev.remove();
        existing.delete(pin.placeSlug);
      }

      const el = createPinElement(selected, pinTheme);
      el.setAttribute(
        "aria-label",
        `${pin.placeName}, ${pin.listingCount} trips`,
      );
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current(pin.placeSlug);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map);

      existing.set(pin.placeSlug, marker);
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: lookById(initialLookId.current).url,
      center: MH_CENTER,
      zoom: 6.2,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    map.fitBounds(MH_BOUNDS, {
      padding: { top: 40, bottom: 48, left: 36, right: 36 },
      duration: 0,
    });

    map.on("load", () => {
      syncMarkers(map);
    });
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Swap basemap when look changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lookId === initialLookId.current) {
      // First effect run after mount - style already applied
      initialLookId.current = lookId;
      return;
    }
    initialLookId.current = lookId;

    const look = lookById(lookId);
    lookRef.current = look;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    map.setStyle(look.url);

    map.once("style.load", () => {
      map.jumpTo({ center, zoom, bearing, pitch });
      syncMarkers(map);
    });
  }, [lookId]);

  // Sync markers when pins / selection change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      syncMarkers(map);
    } else {
      map.once("load", () => syncMarkers(map));
    }
  }, [pins, activeSlug]);

  // Fly to active pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeSlug) return;
    const pin = pins.find((p) => p.placeSlug === activeSlug);
    if (!pin) return;

    map.flyTo({
      center: [pin.longitude, pin.latitude],
      zoom: Math.max(map.getZoom(), 7.4),
      speed: 0.9,
      curve: 1.2,
      essential: true,
    });
  }, [activeSlug, pins]);

  return (
    <div className="relative h-[min(62vh,520px)] min-h-[320px] w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        aria-label="Interactive map of Maharashtra adventure places"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-ink/10"
        aria-hidden
      />
    </div>
  );
}
