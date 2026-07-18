"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  MapPin,
  Check,
  ArrowRight,
} from "lucide-react";
import type { ListingCardData } from "@/types/listing";
import type { PlannerChatMessage, PlannerResponse } from "@/types/planner";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import { TopoLines } from "@/components/ui/primitives";
import { PlannerMarkdown } from "@/components/planner/planner-markdown";
import { PlannerThinking } from "@/components/planner/planner-thinking";

type Phase = "idle" | "thinking" | "reasoning" | "results";

const SUGGESTIONS = [
  "Pune, intermediate, free Saturday, ₹4000, want a waterfall",
  "Easy weekend camping near Lonavala for a group of 6",
  "Adrenaline rush - something extreme under ₹3000",
  "First-time trek, scared of heights, scenic and safe",
];

export function PlannerClientUi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSeededQ = useRef<string | null>(null);

  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [submitted, setSubmitted] = useState("");
  const [history, setHistory] = useState<PlannerChatMessage[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [matches, setMatches] = useState<ListingCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const planRef = useRef<{
    explanation: string;
    listings: ListingCardData[];
  } | null>(null);

  /** Seed input from dock / deep links: /plan?q=... */
  useEffect(() => {
    const q = searchParams.get("q")?.trim();
    if (!q) {
      lastSeededQ.current = null;
      return;
    }
    if (q === lastSeededQ.current) return;
    lastSeededQ.current = q;
    setInput(q);
    setPhase("idle");
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(q.length, q.length);
    });
    router.replace("/plan", { scroll: false });
  }, [searchParams, router]);

  function fillInput(text: string) {
    setInput(text);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(text.length, text.length);
    });
  }

  async function run(query: string) {
    if (!query.trim()) return;
    if (phase === "thinking" || phase === "reasoning") return;
    setSubmitted(query);
    setInput("");
    setPhase("thinking");
    setReasoning("");
    setMatches([]);
    setError(null);

    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: query.trim(), history }),
      });
      if (!response.ok) throw new Error("Planner failed");
      const payload = (await response.json()) as PlannerResponse;
      planRef.current = payload;
      setHistory((h) => [
        ...h,
        { role: "user", content: query.trim() },
        { role: "assistant", content: payload.explanation },
      ]);
      setReasoning(payload.explanation);
      setPhase("reasoning");
    } catch {
      setError(
        "The planner is having trouble right now. Try again in a moment.",
      );
      setPhase("idle");
    }
  }

  useEffect(() => {
    if (phase !== "reasoning" || !reasoning) return;
    const t = setTimeout(() => {
      setMatches(planRef.current?.listings ?? []);
      setPhase("results");
    }, 600);
    return () => clearTimeout(t);
  }, [phase, reasoning]);

  const busy = phase === "thinking" || phase === "reasoning";

  return (
    <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 text-amber-deep text-xs font-bold uppercase tracking-[0.12em] mb-3">
          <Sparkles size={15} /> AI Trip Planner
        </span>
        <h1 className="font-display text-[clamp(28px,5vw,44px)] mb-3">
          Where to this weekend?
        </h1>
        <p className="text-mist text-lg max-w-xl mx-auto">
          Describe your ideal adventure. We&apos;ll find real, bookable matches
          from verified operators - with reasoning.
        </p>
      </div>

      <div className="relative bg-ink rounded-[28px] p-6 overflow-hidden mb-6">
        <TopoLines opacity={0.1} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-full px-5 py-3.5">
            <Sparkles size={18} className="text-amber shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy) run(input);
              }}
              placeholder="e.g. Pune, intermediate, ₹4000, want a waterfall"
              disabled={busy}
              className="bg-transparent flex-1 text-paper placeholder:text-[#8FA396] text-[15px] outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => run(input)}
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-full bg-amber grid place-items-center shrink-0 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={17} className="text-[#3A2406]" />
            </button>
          </div>
          {phase === "idle" || phase === "results" ? (
            <div className="flex gap-2 flex-wrap mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => fillInput(s)}
                  className="text-[13px] bg-white/10 border border-white/12 text-[#C9D2CB] px-3.5 py-2 rounded-full hover:bg-white/15 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-clay text-sm text-center mb-4">{error}</p>
      ) : null}

      <AnimatePresence>
        {phase !== "idle" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="flex gap-3 justify-end">
              <div className="bg-paper-2 rounded-[16px_4px_16px_16px] px-4 py-3 text-[15px] max-w-md">
                {submitted}
              </div>
            </div>

            {phase === "thinking" ? <PlannerThinking /> : null}

            {(phase === "reasoning" || phase === "results") && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-ink grid place-items-center shrink-0 text-amber font-bold">
                  ✦
                </div>
                <div className="flex-1 min-w-0">
                  <PlannerMarkdown content={reasoning} />
                  {phase === "reasoning" ? (
                    <span className="inline-block w-1.5 h-4 bg-amber ml-0.5 animate-pulse align-middle" />
                  ) : null}

                  <div className="mt-5 space-y-3">
                    <AnimatePresence>
                      {matches.map((listing, i) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: i * 0.12,
                            duration: 0.45,
                            ease: [0.22, 0.61, 0.36, 1],
                          }}
                        >
                          <Link
                            href={`/listings/${listing.slug}`}
                            className="group flex gap-4 items-center bg-white border border-line rounded-[14px] p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:translate-x-1 transition-all relative overflow-hidden"
                          >
                            {i === 0 ? (
                              <span className="absolute top-0 left-0 bg-amber text-[#3A2406] font-display font-extrabold text-[11px] px-2.5 py-1 rounded-br-[10px]">
                                BEST FIT
                              </span>
                            ) : (
                              <span className="absolute top-0 left-0 bg-ink text-paper font-display font-extrabold text-[11px] px-2.5 py-1 rounded-br-[10px]">
                                #{i + 1}
                              </span>
                            )}
                            <div
                              className="w-20 h-20 rounded-lg shrink-0 mt-2"
                              style={listingImageStyle(
                                listing.category.slug,
                                listing.heroImageUrl,
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-display font-extrabold text-base mb-0.5">
                                {listing.title}
                              </div>
                              <div className="text-mist text-xs mb-2 flex items-center gap-1.5">
                                <MapPin size={12} /> {listing.place.city} ·{" "}
                                {listing.category.name} ·{" "}
                                {listing.durationHours}h
                              </div>
                              <span className="inline-flex items-center gap-1.5 bg-[#EAF1EC] text-forest text-[11px] font-bold px-2.5 py-1 rounded-full">
                                <Check size={11} /> Real match · verified
                                operator
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-display font-extrabold text-lg">
                                {formatInr(listing.basePrice)}
                              </div>
                              <div className="text-mist text-[11px]">
                                / person
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {phase === "results" ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-5 flex items-center gap-3"
                    >
                      <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 text-amber-deep font-bold text-sm hover:gap-3 transition-all"
                      >
                        See all options <ArrowRight size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setPhase("idle");
                          setSubmitted("");
                          setReasoning("");
                          setMatches([]);
                          setError(null);
                          planRef.current = null;
                          window.requestAnimationFrame(() =>
                            inputRef.current?.focus(),
                          );
                        }}
                        className="text-mist text-sm hover:text-ink"
                      >
                        Start over
                      </button>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
