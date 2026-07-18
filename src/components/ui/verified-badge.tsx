import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({
  label = "Verified",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 text-xs font-bold text-amber-text ${className}`}
    >
      <BadgeCheck size={14} /> {label}
    </span>
  );
}

export function VerificationStatusPill({
  status,
}: {
  status: "UNVERIFIED" | "PENDING" | "VERIFIED";
}) {
  if (status === "VERIFIED") {
    return <VerifiedBadge label="Verified operator" />;
  }
  return (
    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-paper">
      {status === "PENDING"
        ? "Verification in review"
        : "Verification not started"}
    </span>
  );
}
