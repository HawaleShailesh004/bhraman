"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  Users,
  ArrowLeft,
  PartyPopper,
  HeartPulse,
  UserRoundCheck,
  LockKeyhole,
  PhoneCall,
  Minus,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { SlotPickerUi } from "@/components/booking/slot-picker-ui";
import { formatInr } from "@/lib/format";
import { formatGenderMix } from "@/lib/gender-mix";
import { brandEase, slideStep, softSpring, springTap } from "@/lib/motion";
import { listingImageStyle } from "@/lib/ui-present";
import type { BookingCheckoutResponse } from "@/types/booking";
import type { AvailabilitySlotData, ListingDetailData } from "@/types/listing";
import type { TravelerSession } from "@/types/auth";
import type { ReactNode } from "react";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const STEPS = ["Details", "Travelers", "Safety", "Payment", "Confirmed"];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function StepPanel({
  direction,
  reduce,
  children,
  className,
}: {
  direction: 1 | -1;
  reduce: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={slideStep(direction)}
      initial="enter"
      animate="center"
      exit="exit"
      transition={
        reduce ? { duration: 0 } : { duration: 0.28, ease: brandEase }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
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
  const reduceMotion = Boolean(useReducedMotion());
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
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
  const [safety, setSafety] = useState({
    customerGender: "PREFER_NOT_TO_SAY",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalNotes: "",
  });
  const [participants, setParticipants] = useState<
    { name: string; gender: string; ageBand: string }[]
  >([{ name: traveler?.name ?? "", gender: "PREFER_NOT_TO_SAY", ageBand: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountInr: number;
  } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSlots() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/listings/${listing.slug}/availability`,
          {
            cache: "no-store",
          },
        );
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
      setParticipants((current) => {
        if (current[0]?.name) return current;
        return [
          {
            name: traveler.name || "",
            gender: "PREFER_NOT_TO_SAY",
            ageBand: "",
          },
        ];
      });
    }
  }, [traveler]);

  useEffect(() => {
    setParticipants((current) => {
      const next = [...current];
      while (next.length < group) {
        next.push({ name: "", gender: "PREFER_NOT_TO_SAY", ageBand: "" });
      }
      return next.slice(0, group);
    });
  }, [group]);

  useEffect(() => {
    if (searchParams.get("step") === "3") {
      setDirection(1);
      setStep(3);
    }
  }, [searchParams]);

  const paymentReturnUrl = `/book/${listing.slug}?step=3`;
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

  useEffect(() => {
    setGroup((current) =>
      Math.min(Math.max(current, listing.minGroupSize), maxAllowed),
    );
  }, [listing.minGroupSize, maxAllowed]);

  const pricePerHead = selectedSlot?.priceOverride ?? listing.basePrice;
  const subtotal = pricePerHead * group;
  const discountInr = couponApplied?.discountInr ?? 0;
  const total = Math.max(0, subtotal - discountInr);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          listingId: listing.id,
          groupSize: group,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        code?: string;
        discountInr?: number;
        message?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.code || !data.discountInr) {
        throw new Error(data.message || data.error || "Invalid coupon");
      }
      setCouponApplied({ code: data.code, discountInr: data.discountInr });
      pushToast({
        tone: "ok",
        title: "Coupon applied",
        description: data.message ?? `Saved ${formatInr(data.discountInr)}`,
      });
    } catch (error) {
      setCouponApplied(null);
      pushToast({
        tone: "err",
        title: "Coupon not applied",
        description:
          error instanceof Error ? error.message : "Check the code and try again.",
      });
    } finally {
      setCouponBusy(false);
    }
  }

  const seatLabel = useMemo(() => {
    if (!selectedSlot) return "Select a date";
    if (selectedSlot.seatsLeft <= 3)
      return `${selectedSlot.seatsLeft} seats left`;
    return "Seats available";
  }, [selectedSlot]);

  const next = () => {
    if (step === 1) {
      if (!lead.name.trim() || !lead.email.trim() || !lead.phone.trim()) {
        pushToast({
          tone: "err",
          title: "Missing details",
          description: "Add your name, email, and phone to continue.",
        });
        return;
      }
    }
    if (step === 2) {
      if (
        !safety.emergencyContactName.trim() ||
        !safety.emergencyContactPhone.trim()
      ) {
        pushToast({
          tone: "err",
          title: "Emergency contact required",
          description: "Add a name and phone number for your trek leader.",
        });
        return;
      }
    }
    if (step === 3) {
      if (requireSignInForPayment()) return;
      beginCheckout();
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(4, s + 1));
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

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
          traveler: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
          },
          customerGender: safety.customerGender,
          emergencyContactName: safety.emergencyContactName,
          emergencyContactPhone: safety.emergencyContactPhone,
          medicalNotes: safety.medicalNotes,
          participants: participants.map((p, index) => ({
            name: p.name.trim() || (index === 0 ? lead.name : `Guest ${index + 1}`),
            gender: p.gender || safety.customerGender,
            ageBand: p.ageBand || null,
          })),
          couponCode: couponApplied?.code ?? null,
        }),
      });

      const data = (await response.json()) as
        | BookingCheckoutResponse
        | { error?: string; message?: string };
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
      setDirection(1);
      setStep(4);

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
              // Still redirect - booking page will sync from Razorpay on load
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
    <div className="mx-auto max-w-2xl px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-24 sm:px-6 sm:pb-20 sm:pt-28">
      <nav
        className="mb-3 flex items-center overflow-x-auto pb-1 scrollbar-hide"
        aria-label="Booking progress"
      >
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex min-w-0 items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}
          >
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <div
                aria-current={i === step ? "step" : undefined}
                aria-label={`${label}${i < step ? ", completed" : i === step ? ", current step" : ""}`}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[13px] font-extrabold transition-colors duration-200 ${
                  i < step
                    ? "bg-forest text-white"
                    : i === step
                      ? "bg-amber text-amber-text"
                      : "bg-line text-mist"
                }`}
              >
                <motion.span
                  key={`${i}-${i < step ? "done" : i === step ? "on" : "todo"}`}
                  initial={reduceMotion ? false : { scale: 0.7, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={softSpring}
                  className="grid place-items-center"
                >
                  {i < step ? <Check size={15} strokeWidth={3} /> : i + 1}
                </motion.span>
              </div>
              <span
                className={`hidden truncate text-xs font-semibold md:block ${i <= step ? "text-ink" : "text-mist"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div className="mx-1.5 h-0.5 min-w-[12px] flex-1 overflow-hidden bg-line sm:mx-3">
                <motion.div
                  initial={false}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: brandEase }
                  }
                  className="h-full bg-forest"
                />
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      <p className="mb-6 text-center text-xs font-semibold text-mist md:hidden">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <div className="rounded-lg border border-line bg-white p-4 shadow-[var(--shadow-md)] sm:rounded-[22px] sm:p-8">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <StepPanel key="s0" direction={direction} reduce={reduceMotion}>
              <h2 className="font-display text-2xl mb-1">{listing.title}</h2>
              <p className="text-mist text-sm mb-6">
                {listing.place.name}, {listing.place.district}
              </p>
              <div
                className="rounded-xl overflow-hidden h-40 mb-6"
                style={listingImageStyle(
                  listing.category.slug,
                  listing.heroImageUrl,
                )}
              />
              <div className="space-y-3">
                <div className="rounded-lg border border-line p-4">
                  <SlotPickerUi
                    slots={slots}
                    loading={loading}
                    selectedSlotId={selectedSlotId}
                    onSelect={setSelectedSlotId}
                  />
                </div>
                <div className="rounded-lg border border-line p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Users size={18} className="text-mist" />
                    <div className="text-[10px] font-bold uppercase tracking-wide text-mist">
                      Group size
                    </div>
                  </div>
                  <div className="flex max-w-[200px] items-center justify-between">
                    <motion.button
                      type="button"
                      aria-label="Decrease group size"
                      onClick={() =>
                        setGroup(Math.max(listing.minGroupSize, group - 1))
                      }
                      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                      transition={springTap}
                      className="grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-line transition-colors hover:border-ink"
                    >
                      <Minus size={16} />
                    </motion.button>
                    <motion.span
                      key={group}
                      initial={
                        reduceMotion ? false : { scale: 0.92, opacity: 0.6 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={softSpring}
                      className="font-semibold"
                    >
                      {group} people
                    </motion.span>
                    <motion.button
                      type="button"
                      aria-label="Increase group size"
                      onClick={() => setGroup(Math.min(maxAllowed, group + 1))}
                      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                      transition={springTap}
                      className="grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-line transition-colors hover:border-ink"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  <p className="mt-2 text-xs text-mist">{seatLabel}</p>
                </div>
                {selectedSlot ? (
                  <div className="rounded-lg border border-forest/15 bg-[#EAF1EC] p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-muted">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <UserRoundCheck size={15} className="text-forest" />
                        {selectedSlot.femaleCount +
                          selectedSlot.maleCount +
                          selectedSlot.otherCount ===
                        0
                          ? "Be the first to book this departure"
                          : formatGenderMix({
                              female: selectedSlot.femaleCount,
                              male: selectedSlot.maleCount,
                              other: selectedSlot.otherCount,
                              booked: selectedSlot.bookedSeats,
                            }).label}
                      </span>
                      {selectedSlot.minSeatsToConfirm !== null ? (
                        <span>
                          {selectedSlot.status === "CONFIRMED" ||
                          selectedSlot.status === "FULL"
                            ? "Departure confirmed"
                            : `${Math.max(
                                selectedSlot.minSeatsToConfirm -
                                  selectedSlot.confirmedSeats,
                                0,
                              )} more seats to confirm`}
                        </span>
                      ) : null}
                    </div>
                    {selectedSlot.minSeatsToConfirm !== null ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80">
                        <motion.div
                          className="h-full rounded-full bg-forest"
                          initial={false}
                          animate={{
                            width: `${Math.min(
                              100,
                              (selectedSlot.confirmedSeats /
                                selectedSlot.minSeatsToConfirm) *
                                100,
                            )}%`,
                          }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { duration: 0.4, ease: brandEase }
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </StepPanel>
          ) : null}

          {step === 1 ? (
            <StepPanel key="s1" direction={direction} reduce={reduceMotion}>
              <h2 className="font-display text-2xl mb-1">
                Lead traveler details
              </h2>
              <p className="text-mist text-sm mb-6">
                {traveler && clerkConfigured
                  ? "Confirmation will be sent to your signed-in email."
                  : isGuest
                    ? "Add your details now - you'll sign in before payment."
                    : "We'll send the confirmation here."}
              </p>
              <div className="space-y-4">
                {[
                  {
                    k: "name",
                    label: "Full name",
                    ph: "Aditya Kulkarni",
                    type: "text",
                    readOnly: false,
                  },
                  {
                    k: "email",
                    label: "Email",
                    ph: "you@email.com",
                    type: "email",
                    readOnly: Boolean(traveler && clerkConfigured),
                  },
                  {
                    k: "phone",
                    label: "Phone",
                    ph: "+91 98765 43210",
                    type: "tel",
                    readOnly: false,
                  },
                ].map((f) => (
                  <div key={f.k}>
                    <label
                      htmlFor={`lead-${f.k}`}
                      className="mb-2 block text-sm font-bold"
                    >
                      {f.label}
                    </label>
                    <input
                      id={`lead-${f.k}`}
                      type={f.type}
                      value={lead[f.k as keyof typeof lead]}
                      onChange={(e) =>
                        !f.readOnly &&
                        setLead({ ...lead, [f.k]: e.target.value })
                      }
                      readOnly={f.readOnly}
                      placeholder={f.ph}
                      className={`w-full rounded-lg border-[1.5px] border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-amber focus:bg-white focus:ring-[3px] focus:ring-amber/15 ${
                        f.readOnly ? "cursor-default text-mist" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </StepPanel>
          ) : null}

          {step === 2 ? (
            <StepPanel key="s2" direction={direction} reduce={reduceMotion}>
              <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-forest/15 bg-[#EAF1EC] p-4">
                <LockKeyhole
                  size={20}
                  className="mt-0.5 shrink-0 text-forest"
                />
                <div>
                  <h2 className="font-display text-xl">Trip safety details</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#54635A]">
                    Only your operator can access these details for this trip.
                    They are excluded from the customer directory.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 block text-sm font-bold">
                    Who&apos;s coming ({group})
                  </p>
                  <p className="mb-3 text-xs text-mist">
                    You&apos;ll get trip updates on your Bhraman booking page.
                  </p>
                  <div className="space-y-3">
                    {participants.map((p, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-[12px] border border-line p-3 sm:grid-cols-3"
                      >
                        <input
                          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                          placeholder={
                            index === 0 ? "Lead name" : `Guest ${index + 1} name`
                          }
                          value={p.name}
                          onChange={(e) => {
                            const next = [...participants];
                            next[index] = { ...p, name: e.target.value };
                            setParticipants(next);
                          }}
                        />
                        <select
                          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                          value={p.gender}
                          onChange={(e) => {
                            const next = [...participants];
                            next[index] = { ...p, gender: e.target.value };
                            setParticipants(next);
                            if (index === 0) {
                              setSafety({
                                ...safety,
                                customerGender: e.target.value,
                              });
                            }
                          }}
                        >
                          <option value="FEMALE">Female</option>
                          <option value="MALE">Male</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not</option>
                        </select>
                        <select
                          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                          value={p.ageBand}
                          onChange={(e) => {
                            const next = [...participants];
                            next[index] = { ...p, ageBand: e.target.value };
                            setParticipants(next);
                          }}
                        >
                          <option value="">Age band</option>
                          <option value="UNDER_18">Under 18</option>
                          <option value="AGE_18_25">18–25</option>
                          <option value="AGE_26_35">26–35</option>
                          <option value="AGE_36_50">36–50</option>
                          <option value="AGE_50_PLUS">50+</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    id="safety-gender-label"
                    className="mb-2 block text-sm font-bold"
                  >
                    Lead traveler gender
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby="safety-gender-label"
                    className="grid grid-cols-3 gap-2"
                  >
                    {(
                      [
                        { value: "FEMALE", label: "Woman" },
                        { value: "MALE", label: "Man" },
                        { value: "OTHER", label: "Other" },
                      ] as const
                    ).map((option) => {
                      const selected = safety.customerGender === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() =>
                            setSafety({
                              ...safety,
                              customerGender: option.value,
                            })
                          }
                          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                          transition={springTap}
                          className={`relative flex min-h-12 items-center justify-center rounded-xl border-[1.5px] px-2 py-3 text-center text-sm font-semibold transition-colors duration-200 sm:px-3 ${
                            selected
                              ? "border-amber bg-[#FFF9F0] text-ink"
                              : "border-line bg-paper text-[#54635A] hover:border-mist hover:bg-white"
                          }`}
                        >
                          {option.label}
                          {selected ? (
                            <motion.span
                              layoutId={
                                reduceMotion ? undefined : "gender-choice-check"
                              }
                              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber sm:right-2 sm:top-2"
                              transition={softSpring}
                            />
                          ) : null}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      type="button"
                      role="radio"
                      aria-checked={
                        safety.customerGender === "PREFER_NOT_TO_SAY"
                      }
                      onClick={() =>
                        setSafety({
                          ...safety,
                          customerGender: "PREFER_NOT_TO_SAY",
                        })
                      }
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      transition={springTap}
                      className={`relative col-span-3 flex min-h-12 items-center justify-between gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 ${
                        safety.customerGender === "PREFER_NOT_TO_SAY"
                          ? "border-amber bg-[#FFF9F0] text-ink"
                          : "border-line bg-paper text-[#54635A] hover:border-mist hover:bg-white"
                      }`}
                    >
                      <span>
                        Prefer not to say
                        <span className="mt-0.5 block text-[11px] font-medium text-mist">
                          Kept private from the batch mix
                        </span>
                      </span>
                      {safety.customerGender === "PREFER_NOT_TO_SAY" ? (
                        <motion.span
                          layoutId={
                            reduceMotion ? undefined : "gender-choice-check"
                          }
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber text-amber-text"
                          transition={softSpring}
                        >
                          <Check size={12} strokeWidth={3} />
                        </motion.span>
                      ) : (
                        <span className="h-5 w-5 shrink-0 rounded-full border border-line" />
                      )}
                    </motion.button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-mist">
                    Optional. If shared, it contributes to the anonymous batch
                    mix shown to travelers.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <PhoneCall size={16} className="text-amber-deep" />
                  <p className="text-sm font-bold">Emergency contact</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="emergency-name"
                      className="mb-2 block text-sm font-bold"
                    >
                      Emergency contact name
                    </label>
                    <input
                      id="emergency-name"
                      value={safety.emergencyContactName}
                      onChange={(event) =>
                        setSafety({
                          ...safety,
                          emergencyContactName: event.target.value,
                        })
                      }
                      placeholder="Contact name"
                      autoComplete="off"
                      className="w-full rounded-lg border-[1.5px] border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-amber focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="emergency-phone"
                      className="mb-2 block text-sm font-bold"
                    >
                      Emergency contact phone
                    </label>
                    <input
                      id="emergency-phone"
                      type="tel"
                      value={safety.emergencyContactPhone}
                      onChange={(event) =>
                        setSafety({
                          ...safety,
                          emergencyContactPhone: event.target.value,
                        })
                      }
                      placeholder="+91 98765 43210"
                      inputMode="tel"
                      autoComplete="off"
                      className="w-full rounded-lg border-[1.5px] border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-amber focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="medical-notes"
                    className="mb-2 block text-sm font-bold"
                  >
                    Medical or accessibility notes{" "}
                    <span className="font-normal text-mist">(optional)</span>
                  </label>
                  <textarea
                    id="medical-notes"
                    rows={4}
                    value={safety.medicalNotes}
                    onChange={(event) =>
                      setSafety({ ...safety, medicalNotes: event.target.value })
                    }
                    placeholder="Allergies, conditions, medications, accessibility needs, or anything the guide should know."
                    maxLength={1000}
                    className="w-full resize-none rounded-lg border-[1.5px] border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-amber focus:bg-white"
                  />
                  <p className="mt-1.5 text-xs text-mist">
                    Include only what the trip leader needs to prepare safe and
                    appropriate support.
                  </p>
                </div>
                <div className="flex gap-2 rounded-[14px] border border-forest/15 bg-[#EAF1EC] p-3 text-xs text-[#54635A]">
                  <HeartPulse size={17} className="shrink-0 text-forest" />
                  This information is excluded from public pages and customer
                  lists. It is intended for the specific trip roster only.
                </div>
              </div>
            </StepPanel>
          ) : null}

          {step === 3 ? (
            <StepPanel key="s3" direction={direction} reduce={reduceMotion}>
              <h2 className="font-display text-2xl mb-1">Payment method</h2>
              <p className="text-mist text-sm mb-6">
                Secured by Razorpay {checkoutReady ? "" : "(loading…)"}
              </p>
              {isGuest ? (
                <div className="mb-5 rounded-[14px] border border-amber/30 bg-[#FFF9F0] px-4 py-3 text-sm text-[#54635A]">
                  Sign in to complete payment. Your slot and traveler details
                  are saved on this page.{" "}
                  <button
                    type="button"
                    onClick={redirectToSignInForPayment}
                    className="font-semibold text-amber-deep underline underline-offset-2"
                  >
                    Sign in to pay
                  </button>
                </div>
              ) : null}
              <div className="mb-6 space-y-3">
                {[
                  {
                    k: "upi",
                    icon: Smartphone,
                    name: "UPI",
                    sub: "GPay, PhonePe, Paytm",
                  },
                  {
                    k: "card",
                    icon: CreditCard,
                    name: "Card",
                    sub: "Credit / Debit",
                  },
                  {
                    k: "netbanking",
                    icon: Building2,
                    name: "Netbanking",
                    sub: "All major banks",
                  },
                ].map((m) => (
                  <motion.button
                    key={m.k}
                    type="button"
                    aria-pressed={method === m.k}
                    onClick={() => setMethod(m.k)}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    transition={springTap}
                    className={`relative flex w-full items-center gap-3 rounded-lg border-[1.5px] p-3.5 text-left transition-colors duration-200 ${
                      method === m.k
                        ? "border-amber bg-[#FFF9F0]"
                        : "border-line hover:border-mist"
                    }`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-paper-2">
                      <m.icon size={18} />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="text-xs text-mist">{m.sub}</div>
                    </div>
                    <AnimatePresence>
                      {method === m.k ? (
                        <motion.span
                          key="check"
                          initial={
                            reduceMotion ? false : { scale: 0.6, opacity: 0 }
                          }
                          animate={{ scale: 1, opacity: 1 }}
                          exit={
                            reduceMotion
                              ? undefined
                              : { scale: 0.6, opacity: 0 }
                          }
                          transition={softSpring}
                        >
                          <Check size={18} className="text-amber-deep" />
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </StepPanel>
          ) : null}

          {step === 4 ? (
            <StepPanel
              key="s4"
              direction={direction}
              reduce={reduceMotion}
              className="py-6 text-center"
            >
              <motion.div
                className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-forest"
                initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={softSpring}
              >
                <PartyPopper size={32} className="text-white" />
              </motion.div>
              <h2 className="mb-2 font-display text-2xl">Booking created!</h2>
              {bookingRef ? (
                <p className="mb-1 text-mist">
                  Reference{" "}
                  <span className="font-bold text-ink">{bookingRef}</span>
                </p>
              ) : null}
              <p className="mb-6 text-sm text-mist">
                Complete payment in the Razorpay window or check your booking
                status.
              </p>
              <Link
                href={bookingRef ? `/booking/${bookingRef}` : "/bookings"}
                className="inline-flex items-center gap-2 rounded-full bg-amber px-7 py-3.5 font-bold text-[#3A2406] transition-transform hover:-translate-y-0.5"
              >
                View booking
              </Link>
            </StepPanel>
          ) : null}
        </AnimatePresence>

        {step < 4 ? (
          <>
            <div className="border-t border-dashed border-line mt-6 pt-5 text-sm space-y-2">
              <details className="group rounded-[12px] border border-line/80 bg-paper-2/50 px-3 py-2">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-mist">
                  Have a coupon?
                </summary>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Operator code"
                    className="flex-1 rounded-full border border-line px-3 py-2 text-sm uppercase"
                  />
                  <button
                    type="button"
                    disabled={couponBusy}
                    onClick={() => void applyCoupon()}
                    className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-paper disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied ? (
                  <p className="mt-2 text-xs font-semibold text-forest">
                    {couponApplied.code} applied · −{formatInr(couponApplied.discountInr)}
                  </p>
                ) : null}
              </details>
              <div className="flex justify-between text-[#54635A]">
                <span>
                  {formatInr(pricePerHead)} × {group}
                </span>
                <span>{formatInr(subtotal)}</span>
              </div>
              {discountInr > 0 ? (
                <div className="flex justify-between text-forest">
                  <span>Coupon discount</span>
                  <span>−{formatInr(discountInr)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatInr(total)}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              {step > 0 ? (
                <motion.button
                  type="button"
                  onClick={back}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={springTap}
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-line px-5 py-3 text-sm font-bold transition-colors hover:border-ink"
                >
                  <ArrowLeft size={16} /> Back
                </motion.button>
              ) : null}
              <motion.button
                type="button"
                onClick={next}
                disabled={
                  !selectedSlot ||
                  selectedSlot.seatsLeft < group ||
                  slots.length === 0 ||
                  submitting
                }
                whileHover={
                  reduceMotion ||
                  !selectedSlot ||
                  selectedSlot.seatsLeft < group ||
                  submitting
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  reduceMotion ||
                  !selectedSlot ||
                  selectedSlot.seatsLeft < group ||
                  submitting
                    ? undefined
                    : { scale: 0.98 }
                }
                transition={softSpring}
                className="touch-target flex-1 rounded-full bg-amber py-3 font-bold text-amber-text shadow-[0_8px_20px_rgba(224,138,43,0.32)] disabled:opacity-60"
              >
                {step === 3
                  ? submitting
                    ? "Creating order…"
                    : isGuest
                      ? "Sign in to pay"
                      : `Pay ${formatInr(total)}`
                  : "Continue"}
              </motion.button>
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
