"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  CalendarDays,
  Users,
  ArrowLeft,
  PartyPopper,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { formatInr } from "@/lib/format";
import { listingImageStyle } from "@/lib/ui-present";
import type { BookingCheckoutResponse } from "@/types/booking";
import type { AvailabilitySlotData, ListingDetailData } from "@/types/listing";
import type { TravelerSession } from "@/types/auth";

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const PLATFORM_FEE_RATE = 0.05;
const STEPS = ["Details", "Travelers", "Payment", "Confirmed"];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function formatSlotDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BookingFlowUi({
  listing,
  traveler,
}: {
  listing: ListingDetailData;
  traveler: TravelerSession | null;
}) {
  if (clerkConfigured) {
    return <BookingFlowClerkBridge listing={listing} traveler={traveler} />;
  }

  return (
    <BookingFlowContent
      listing={listing}
      traveler={traveler}
      isSignedIn
      isLoaded
    />
  );
}

function BookingFlowClerkBridge({
  listing,
  traveler,
}: {
  listing: ListingDetailData;
  traveler: TravelerSession | null;
}) {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <BookingFlowContent
      listing={listing}
      traveler={traveler}
      isSignedIn={Boolean(isSignedIn)}
      isLoaded={isLoaded}
    />
  );
}

function BookingFlowContent({
  listing,
  traveler,
  isSignedIn,
  isLoaded,
}: {
  listing: ListingDetailData;
  traveler: TravelerSession | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState<AvailabilitySlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [group, setGroup] = useState(listing.minGroupSize);
  const [method, setMethod] = useState("upi");
  const [lead, setLead] = useState({
    name: traveler?.name ?? "",
    email: traveler?.email ?? "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadSlots() {
      setLoading(true);
      try {
        const response = await fetch(`/api/listings/${listing.slug}/availability`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed");
        const data = (await response.json()) as AvailabilitySlotData[];
        if (!active) return;
        setSlots(data);
        setSelectedSlotId(data[0]?.id ?? null);
      } catch {
        if (active) setSlots([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSlots();
    return () => {
      active = false;
    };
  }, [listing.slug]);

  useEffect(() => {
    if (traveler) {
      setLead((current) => ({
        ...current,
        name: current.name || traveler.name,
        email: current.email || traveler.email,
      }));
    }
  }, [traveler]);

  useEffect(() => {
    if (searchParams.get("step") === "2") {
      setStep(2);
    }
  }, [searchParams]);

  const paymentReturnUrl = `/book/${listing.slug}?step=2`;
  const isGuest = clerkConfigured && isLoaded && !isSignedIn;

  function redirectToSignInForPayment() {
    router.push(
      `/sign-in?redirect_url=${encodeURIComponent(paymentReturnUrl)}`,
    );
  }

  function requireSignInForPayment() {
    if (!clerkConfigured) return false;
    if (!isLoaded) return true;
    if (!isSignedIn) {
      redirectToSignInForPayment();
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (typeof window === "undefined" || window.Razorpay) {
      setCheckoutReady(Boolean(window?.Razorpay));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setCheckoutReady(true);
    document.body.appendChild(script);
  }, []);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;
  const maxAllowed = selectedSlot
    ? Math.min(listing.maxGroupSize, selectedSlot.seatsLeft)
    : listing.maxGroupSize;

  const pricePerHead = selectedSlot?.priceOverride ?? listing.basePrice;
  const subtotal = pricePerHead * group;
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + fee;

  const seatLabel = useMemo(() => {
    if (!selectedSlot) return "Select a date";
    if (selectedSlot.seatsLeft <= 3) return `${selectedSlot.seatsLeft} seats left`;
    return "Seats available";
  }, [selectedSlot]);

  const next = () => {
    if (step === 1) {
      if (!lead.name.trim() || !lead.email.trim()) {
        pushToast({
          tone: "err",
          title: "Missing details",
          description: "Add your name and email to continue.",
        });
        return;
      }
    }
    if (step === 2) {
      if (requireSignInForPayment()) return;
      beginCheckout();
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  async function beginCheckout() {
    if (requireSignInForPayment()) return;

    if (!selectedSlot || !lead.name.trim() || !lead.email.trim()) {
      pushToast({
        tone: "err",
        title: "Missing details",
        description: "Select a slot and add traveler details.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          slotId: selectedSlot.id,
          groupSize: group,
          traveler: { name: lead.name, email: lead.email },
        }),
      });

      const data = (await response.json()) as BookingCheckoutResponse | { error?: string; message?: string };
      if (response.status === 401) {
        pushToast({
          tone: "err",
          title: "Sign in required",
          description: "Please sign in to complete your booking.",
        });
        router.push(
          `/sign-in?redirect_url=${encodeURIComponent(paymentReturnUrl)}`,
        );
        return;
      }
      if (!response.ok || !("bookingRef" in data)) {
        throw new Error(("error" in data && data.error) || "Booking failed");
      }

      setBookingRef(data.bookingRef);
      setStep(3);

      if (
        data.mode === "razorpay" &&
        data.keyId &&
        typeof window !== "undefined" &&
        window.Razorpay
      ) {
        const checkout = new window.Razorpay({
          key: data.keyId,
          amount: data.amount * 100,
          currency: data.currency,
          name: "Bhraman",
          description: listing.title,
          order_id: data.razorpayOrderId,
          prefill: { name: lead.name, email: lead.email },
          notes: { bookingRef: data.bookingRef },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await fetch("/api/bookings/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingRef: data.bookingRef,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
            } catch {
              // Still redirect — booking page will sync from Razorpay on load
            }
            router.push(`/booking/${data.bookingRef}`);
          },
          modal: {
            ondismiss: () => router.push(`/booking/${data.bookingRef}`),
          },
        });
        checkout.open();
        return;
      }

      router.push(`/booking/${data.bookingRef}`);
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Could not book.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
      <div className="flex items-center mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full grid place-items-center font-display font-extrabold text-[13px] transition-colors ${
                  i < step
                    ? "bg-forest text-white"
                    : i === step
                      ? "bg-amber text-[#3A2406]"
                      : "bg-line text-mist"
                }`}
              >
                {i < step ? <Check size={15} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:block ${i <= step ? "text-ink" : "text-mist"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div className={`h-0.5 flex-1 mx-3 ${i < step ? "bg-forest" : "bg-line"}`} />
            ) : null}
          </div>
        ))}
      </div>

      <div className="bg-white border border-line rounded-[22px] p-6 sm:p-8 shadow-[var(--shadow-md)]">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-2xl mb-1">{listing.title}</h2>
              <p className="text-mist text-sm mb-6">
                {listing.place.name}, {listing.place.district}
              </p>
              <div
                className="rounded-xl overflow-hidden h-40 mb-6"
                style={listingImageStyle(listing.category.slug, listing.heroImageUrl)}
              />
              <div className="space-y-3">
                <div className="border border-line rounded-lg p-4">
                  <div className="text-[10px] font-bold tracking-wide uppercase text-mist mb-1">
                    Date
                  </div>
                  {loading ? (
                    <span className="text-mist text-sm">Loading dates…</span>
                  ) : slots.length === 0 ? (
                    <span className="text-clay text-sm">No open dates yet</span>
                  ) : (
                    <select
                      value={selectedSlotId ?? ""}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="w-full font-semibold bg-transparent outline-none"
                    >
                      {slots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {formatSlotDateTime(slot.startTime)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="border border-line rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users size={18} className="text-mist" />
                    <div className="text-[10px] font-bold tracking-wide uppercase text-mist">
                      Group size
                    </div>
                  </div>
                  <div className="flex items-center justify-between max-w-[200px]">
                    <button
                      type="button"
                      onClick={() => setGroup(Math.max(listing.minGroupSize, group - 1))}
                      className="w-9 h-9 rounded-full border-[1.5px] border-line grid place-items-center hover:border-ink"
                    >
                      −
                    </button>
                    <span className="font-semibold">{group} people</span>
                    <button
                      type="button"
                      onClick={() => setGroup(Math.min(maxAllowed, group + 1))}
                      className="w-9 h-9 rounded-full border-[1.5px] border-line grid place-items-center hover:border-ink"
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-mist">{seatLabel}</p>
                </div>
              </div>
            </motion.div>
          ) : null}

          {step === 1 ? (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl mb-1">Lead traveler details</h2>
              <p className="text-mist text-sm mb-6">
                {traveler && clerkConfigured
                  ? "Confirmation will be sent to your signed-in email."
                  : isGuest
                    ? "Add your details now — you'll sign in before payment."
                    : "We'll send the confirmation here."}
              </p>
              <div className="space-y-4">
                {[
                  { k: "name", label: "Full name", ph: "Aditya Kulkarni", type: "text", readOnly: false },
                  {
                    k: "email",
                    label: "Email",
                    ph: "you@email.com",
                    type: "email",
                    readOnly: Boolean(traveler && clerkConfigured),
                  },
                  { k: "phone", label: "Phone (optional)", ph: "+91 98765 43210", type: "tel", readOnly: false },
                ].map((f) => (
                  <div key={f.k}>
                    <label className="block text-sm font-bold mb-2">{f.label}</label>
                    <input
                      type={f.type}
                      value={lead[f.k as keyof typeof lead]}
                      onChange={(e) =>
                        !f.readOnly &&
                        setLead({ ...lead, [f.k]: e.target.value })
                      }
                      readOnly={f.readOnly}
                      placeholder={f.ph}
                      className={`w-full border-[1.5px] border-line rounded-lg px-4 py-3 text-[15px] bg-paper focus:bg-white focus:border-amber focus:ring-[3px] focus:ring-amber/15 outline-none ${
                        f.readOnly ? "text-mist cursor-default" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl mb-1">Payment method</h2>
              <p className="text-mist text-sm mb-6">
                Secured by Razorpay {checkoutReady ? "" : "(loading…)"}
              </p>
              {isGuest ? (
                <div className="mb-5 rounded-[14px] border border-amber/30 bg-[#FFF9F0] px-4 py-3 text-sm text-[#54635A]">
                  Sign in to complete payment. Your slot and traveler details are
                  saved on this page.{" "}
                  <button
                    type="button"
                    onClick={redirectToSignInForPayment}
                    className="font-semibold text-amber-deep underline underline-offset-2"
                  >
                    Sign in to pay
                  </button>
                </div>
              ) : null}
              <div className="space-y-3 mb-6">
                {[
                  { k: "upi", icon: Smartphone, name: "UPI", sub: "GPay, PhonePe, Paytm" },
                  { k: "card", icon: CreditCard, name: "Card", sub: "Credit / Debit" },
                  { k: "netbanking", icon: Building2, name: "Netbanking", sub: "All major banks" },
                ].map((m) => (
                  <button
                    key={m.k}
                    type="button"
                    onClick={() => setMethod(m.k)}
                    className={`w-full flex items-center gap-3 border-[1.5px] rounded-lg p-3.5 text-left ${
                      method === m.k ? "border-amber bg-[#FFF9F0]" : "border-line hover:border-mist"
                    }`}
                  >
                    <span className="w-9 h-9 rounded-lg bg-paper-2 grid place-items-center">
                      <m.icon size={18} />
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{m.name}</div>
                      <div className="text-mist text-xs">{m.sub}</div>
                    </div>
                    {method === m.k ? <Check size={18} className="text-amber-deep" /> : null}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-forest grid place-items-center mx-auto mb-5">
                <PartyPopper size={32} className="text-white" />
              </div>
              <h2 className="font-display text-2xl mb-2">Booking created!</h2>
              {bookingRef ? (
                <p className="text-mist mb-1">
                  Reference <span className="font-bold text-ink">{bookingRef}</span>
                </p>
              ) : null}
              <p className="text-mist text-sm mb-6">
                Complete payment in the Razorpay window or check your booking status.
              </p>
              <Link
                href={bookingRef ? `/booking/${bookingRef}` : "/bookings"}
                className="inline-flex items-center gap-2 bg-amber text-[#3A2406] rounded-full px-7 py-3.5 font-bold"
              >
                View booking
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {step < 3 ? (
          <>
            <div className="border-t border-dashed border-line mt-6 pt-5 text-sm space-y-2">
              <div className="flex justify-between text-[#54635A]">
                <span>
                  {formatInr(pricePerHead)} × {group}
                </span>
                <span>{formatInr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#54635A]">
                <span>Platform fee</span>
                <span>{formatInr(fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatInr(total)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-2 border-[1.5px] border-line rounded-full px-5 py-3 font-bold text-sm hover:border-ink"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : null}
              <button
                type="button"
                onClick={next}
                disabled={!selectedSlot || slots.length === 0 || submitting}
                className="flex-1 bg-amber text-[#3A2406] rounded-full py-3 font-bold shadow-[0_8px_20px_rgba(224,138,43,0.32)] hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              >
                {step === 2
                  ? submitting
                    ? "Creating order…"
                    : isGuest
                      ? "Sign in to pay"
                      : `Pay ${formatInr(total)}`
                  : "Continue"}
              </button>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-mist text-xs mt-4">
              <Shield size={13} /> Free cancellation up to{" "}
              {listing.cancellationPolicy.cutoffHours}h · Secure payment
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
