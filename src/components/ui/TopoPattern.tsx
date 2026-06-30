const TOPO_PATHS = [
  "M0 320 Q300 280 600 310 T1200 290",
  "M0 290 Q300 250 600 280 T1200 260",
  "M0 260 Q300 215 600 250 T1200 228",
  "M0 228 Q300 180 600 218 T1200 196",
  "M0 196 Q300 148 600 186 T1200 164",
  "M0 164 Q300 116 600 154 T1200 132",
  "M0 132 Q300 86 600 122 T1200 102",
  "M0 102 Q300 58 600 92 T1200 74",
];

type TopoPatternProps = {
  className?: string;
  viewBox?: string;
};

export function TopoPattern({
  className = "absolute inset-0 z-[1] opacity-[0.18]",
  viewBox = "0 0 1200 400",
}: TopoPatternProps) {
  return (
    <svg
      className={className}
      preserveAspectRatio="none"
      viewBox={viewBox}
      aria-hidden
    >
      <g fill="none" stroke="#E08A2B" strokeWidth="1">
        {TOPO_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
