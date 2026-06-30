import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "ok" | "warn" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  ok: "badge badge-ok",
  warn: "badge badge-warn",
  danger: "badge badge-danger",
  info: "badge badge-info",
};

export function Badge({
  children,
  tone = "ok",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={cn(toneClasses[tone], className)}>{children}</span>;
}

export function Pill({
  children,
  dark = false,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return <span className={cn("pill", dark && "pill-cat", className)}>{children}</span>;
}
