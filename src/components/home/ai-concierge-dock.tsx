"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { COPY } from "@/lib/marketing-copy";
import { brandEase, softSpring, springTap } from "@/lib/motion";

const HELLO_STORAGE_KEY = "bhraman-ai-hello-dismissed";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-0.5 py-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-mist"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

function ChatBubbleMessage({
  reduce,
  onOpen,
  onDismiss,
}: {
  reduce: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const [phase, setPhase] = useState<"typing" | "message">(
    reduce ? "message" : "typing",
  );

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setPhase("message"), 900);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <motion.div
      initial={
        reduce ? { opacity: 0 } : { opacity: 0, scale: 0.2, x: 28, y: 36 }
      }
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.35, x: 20, y: 28 }}
      transition={
        reduce
          ? { duration: 0.15 }
          : { type: "spring", stiffness: 380, damping: 22, mass: 0.85 }
      }
      style={{ transformOrigin: "bottom right" }}
      className="pointer-events-auto relative max-w-[min(100vw-5.5rem,280px)]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative w-full rounded-[18px] rounded-br-md border border-line bg-white px-4 py-3.5 text-left shadow-[var(--shadow-lg)]"
      >
        <span
          className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-line bg-white"
          aria-hidden
        />

        <div className="relative z-10 min-h-[2.75rem]">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "typing" ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-amber">
                  <Sparkles size={12} />
                </span>
                <TypingDots />
              </motion.div>
            ) : (
              <motion.div
                key="message"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: brandEase }}
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-amber">
                    <Sparkles size={10} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-mist">
                    Bhraman
                  </span>
                </div>
                <p className="text-[15px] font-bold leading-snug text-ink">
                  {COPY.ai.dockGreeting}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>

      <button
        type="button"
        aria-label="Dismiss greeting"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-line bg-white text-mist shadow-sm hover:text-ink"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

function shouldHideDock(pathname: string) {
  return (
    pathname.startsWith("/listings/") ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/booking/") ||
    pathname === "/discover" ||
    pathname.startsWith("/discover/") ||
    pathname === "/operators" ||
    pathname.startsWith("/operators/") ||
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/")
  );
}

export function useAiConciergeDockVisible() {
  const pathname = usePathname();
  return useMemo(() => !shouldHideDock(pathname), [pathname]);
}

export function AiConciergeDock() {
  const visible = useAiConciergeDockVisible();
  const reduce = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const [showHello, setShowHello] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (sessionStorage.getItem(HELLO_STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      setShowHello(true);
      setPulse(true);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (!pulse) return;
    const t = window.setTimeout(() => setPulse(false), 2400);
    return () => window.clearTimeout(t);
  }, [pulse]);

  function dismissHello() {
    setShowHello(false);
    try {
      sessionStorage.setItem(HELLO_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function openDock() {
    setOpen(true);
    dismissHello();
  }

  useEffect(() => {
    if (!visible) {
      setOpen(false);
      setShowHello(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {showHello && !open ? (
          <ChatBubbleMessage
            key="hello-bubble"
            reduce={reduce}
            onOpen={openDock}
            onDismiss={dismissHello}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="AI trip planner shortcuts"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.55, x: 24, y: 40 }
            }
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={
              reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, x: 16, y: 28 }
            }
            transition={
              reduce
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 340, damping: 24 }
            }
            style={{ transformOrigin: "bottom right" }}
            className="pointer-events-auto w-[min(100vw-2rem,320px)] overflow-hidden rounded-[22px] border border-line bg-white shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line bg-ink px-4 py-3.5 text-paper">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  <Sparkles size={14} className="text-amber" /> Bhraman planner
                </p>
                <p className="mt-0.5 text-xs text-[#A8B7AD]">
                  {COPY.ai.dockHint}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close planner shortcuts"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-[#A8B7AD] hover:bg-white/10 hover:text-paper"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 p-3">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.28, ease: brandEase }}
                className="rounded-2xl rounded-bl-md bg-paper-2 px-3.5 py-2.5"
              >
                <p className="text-xs font-semibold text-mist">Bhraman</p>
                <p className="mt-0.5 text-sm leading-snug text-ink">
                  {COPY.ai.dockHint}
                </p>
              </motion.div>
              {COPY.ai.starters.map((starter, i) => (
                <motion.div
                  key={starter.href}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.18 + i * 0.06,
                    duration: 0.25,
                    ease: brandEase,
                  }}
                >
                  <Link
                    href={starter.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl border border-line bg-paper px-3.5 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber hover:bg-[#FFF9F0]"
                  >
                    {starter.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.25, ease: brandEase }}
              >
                <Link
                  href="/plan"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-amber py-2.5 text-sm font-bold text-amber-text"
                >
                  <Sparkles size={15} /> Open full planner
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {pulse && !open ? (
            <motion.span
              key="ring"
              className="absolute inset-0 rounded-full bg-amber"
              initial={{ scale: 1, opacity: 0.45 }}
              animate={{ scale: 1.55, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              aria-hidden
            />
          ) : null}
        </AnimatePresence>
        <motion.button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close AI helper" : "Open AI helper"}
          onClick={() => {
            if (open) setOpen(false);
            else openDock();
          }}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={springTap}
          className="pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full bg-amber text-amber-text shadow-amber-glow"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "msg"}
              initial={reduce ? false : { opacity: 0, rotate: -40, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, rotate: 40, scale: 0.7 }}
              transition={softSpring}
              className="grid place-items-center"
            >
              {open ? <X size={22} /> : <MessageCircle size={22} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
