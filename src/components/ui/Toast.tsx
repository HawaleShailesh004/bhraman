"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
type ToastTone = "ok" | "err";

export function Toast({
  open = true,
  title,
  description,
  tone = "ok",
  icon,
}: {
  open?: boolean;
  title: string;
  description: string;
  tone?: ToastTone;
  icon?: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className={cn("toast", tone === "ok" ? "ok" : "err")}
        >
          <div className="tc">
            {icon ??
              (tone === "ok" ? (
                <Check size={16} strokeWidth={2.5} aria-hidden />
              ) : (
                <AlertCircle size={16} strokeWidth={2.5} aria-hidden />
              ))}
          </div>
          <div>
            <div className="tt">{title}</div>
            <div className="td">{description}</div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
