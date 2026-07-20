"use client";

import type { CSSProperties, MouseEvent, ReactNode, RefObject } from "react";
import { useRef } from "react";

/**
 * Pattern 10 - Soft 3D tilt + glare toward cursor (desktop).
 * Respects prefers-reduced-motion via `enabled={false}`.
 */
export function useCardTilt(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 12;
    el.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  return { ref, onMove, onLeave };
}

export function TiltShell({
  enabled,
  children,
  className = "",
}: {
  enabled: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { ref, onMove, onLeave } = useCardTilt(enabled);

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative will-change-transform [transform-style:preserve-3d] ${className}`}
      style={
        {
          transition: "transform 0.2s ease-out",
          "--gx": "50%",
          "--gy": "50%",
        } as CSSProperties
      }
    >
      {children}
      {enabled ? (
        <div
          className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.22), transparent 45%)",
          }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
