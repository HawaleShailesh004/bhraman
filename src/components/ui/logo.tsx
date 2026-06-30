export function Logo({ size = 34, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-label="Bhraman logo">
      <path
        d="M8 30 Q16 20 22 26 T36 22"
        stroke={dark ? "#FAF8F3" : "#2D5A3D"}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 24 Q16 14 22 20 T36 16"
        stroke="#E08A2B"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="22" cy="23" r="3.5" fill={dark ? "#FAF8F3" : "#1A2E22"} />
    </svg>
  );
}
