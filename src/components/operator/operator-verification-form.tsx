"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Clock3,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/ToastProvider";
import { brandEase, softSpring } from "@/lib/motion";
import type { OperatorVerificationData } from "@/types/operator";

export function OperatorVerificationForm({
  initial,
}: {
  initial: OperatorVerificationData;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const reduce = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    yearsOperating: initial.yearsOperating ?? 0,
    panNumber: initial.panNumber ?? "",
    gstNumber: initial.gstNumber ?? "",
    mtdcRegistrationNo: initial.mtdcRegistrationNo ?? "",
    insuranceStatus: initial.insuranceStatus,
    insuranceProvider: initial.insuranceProvider ?? "",
    insuranceDetails: initial.insuranceDetails ?? "",
    femaleGuideCount: initial.femaleGuideCount,
    totalGuideCount: initial.totalGuideCount,
    posHPolicyStatus: initial.posHPolicyStatus,
  });

  const checks = useMemo(
    () => [
      { label: "Business experience", done: form.yearsOperating > 0 },
      { label: "PAN provided", done: Boolean(form.panNumber.trim()) },
      { label: "Phone verified", done: initial.phoneVerified },
      {
        label: "Guide team details",
        done: form.totalGuideCount > 0,
      },
      {
        label: "Insurance details",
        done:
          form.insuranceStatus &&
          Boolean(form.insuranceProvider.trim()),
      },
      {
        label: "POSH readiness",
        done: form.posHPolicyStatus !== "NOT_STARTED",
      },
    ],
    [form, initial.phoneVerified],
  );
  const completion = Math.round(
    (checks.filter((check) => check.done).length / checks.length) * 100,
  );
  const validationError = useMemo(() => {
    const pan = form.panNumber.trim();
    const gst = form.gstNumber.trim();
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      return "PAN must follow the format ABCDE1234F.";
    }
    if (
      gst &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gst)
    ) {
      return "Enter a valid 15-character GSTIN.";
    }
    if (form.femaleGuideCount > form.totalGuideCount) {
      return "Women guides cannot be more than total guides.";
    }
    if (form.insuranceStatus && !form.insuranceProvider.trim()) {
      return "Add the insurance provider when participant insurance is active.";
    }
    return null;
  }, [form]);

  async function save() {
    if (validationError) {
      pushToast({
        tone: "err",
        title: "Check your details",
        description: validationError,
      });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/operator/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as {
        error?: string;
        verificationStatus?: string;
      };
      if (!response.ok) {
        throw new Error(
          result.error === "INVALID_PAN"
            ? "Enter a valid 10-character PAN."
            : result.error === "INVALID_GST"
              ? "Enter a valid GSTIN."
              : result.error === "INVALID_PAYLOAD"
                ? "Check guide counts and number fields, then try again."
                : "Could not save verification details.",
        );
      }
      pushToast({
        title: "Trust profile saved",
        description:
          result.verificationStatus === "VERIFIED"
            ? "Your verified profile is up to date."
            : "Your details are pending platform review.",
      });
      router.refresh();
    } catch (error) {
      pushToast({
        tone: "err",
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Could not save details.",
      });
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border-[1.5px] border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-amber focus:bg-white focus:ring-4 focus:ring-amber/10";

  const statusMeta =
    initial.verificationStatus === "VERIFIED"
      ? {
          icon: BadgeCheck,
          title: "Profile verified",
          copy: "Your trust profile is live. Saved updates remain verified and are logged for review.",
          tone: "border-forest/20 bg-[#EAF1EC] text-forest",
        }
      : initial.verificationStatus === "PENDING"
        ? {
            icon: Clock3,
            title: "Review in progress",
            copy: "Your submitted details are awaiting platform review. You can still correct or complete them.",
            tone: "border-amber/25 bg-[#FFF9F0] text-amber-deep",
          }
        : {
            icon: AlertCircle,
            title: "Complete your trust profile",
            copy: "Add your business, team, and safety details to submit the profile for review.",
            tone: "border-line bg-paper-2 text-ink",
          };
  const StatusIcon = statusMeta.icon;

  return (
    <div>
      <div
        className={`mb-5 flex items-start gap-3 rounded-[14px] border p-4 ${statusMeta.tone}`}
        role="status"
      >
        <StatusIcon size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">{statusMeta.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-80">
            {statusMeta.copy}
          </p>
        </div>
      </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6 rounded-md border border-line bg-white p-4 shadow-[var(--shadow-sm)] sm:rounded-[14px] sm:p-6">
        <div>
          <p className="font-display text-lg">Business details</p>
          <p className="mt-1 text-xs text-mist">
            Registration numbers are reviewed privately and are never exposed
            on your public profile.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Years operating
            <input
              type="number"
              min={0}
              max={100}
              value={form.yearsOperating}
              onChange={(event) =>
                setForm({
                  ...form,
                  yearsOperating: Number(event.target.value),
                })
              }
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-sm font-bold">
            PAN
            <input
              value={form.panNumber}
              onChange={(event) =>
                setForm({ ...form, panNumber: event.target.value.toUpperCase() })
              }
              maxLength={10}
              placeholder="ABCDE1234F"
              className={`${inputClass} mt-2 font-mono uppercase`}
              aria-invalid={
                Boolean(form.panNumber) &&
                !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber)
              }
            />
          </label>
          <label className="text-sm font-bold">
            GSTIN <span className="font-normal text-mist">(optional)</span>
            <input
              value={form.gstNumber}
              onChange={(event) =>
                setForm({ ...form, gstNumber: event.target.value.toUpperCase() })
              }
              maxLength={15}
              className={`${inputClass} mt-2 font-mono uppercase`}
            />
          </label>
          <label className="text-sm font-bold">
            MTDC / Ministry registration{" "}
            <span className="font-normal text-mist">(optional)</span>
            <input
              value={form.mtdcRegistrationNo}
              onChange={(event) =>
                setForm({ ...form, mtdcRegistrationNo: event.target.value })
              }
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-sm font-bold">
            Total guides
            <input
              type="number"
              min={0}
              value={form.totalGuideCount}
              onChange={(event) =>
                setForm({
                  ...form,
                  totalGuideCount: Number(event.target.value),
                })
              }
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-sm font-bold">
            Women guides
            <input
              type="number"
              min={0}
              max={form.totalGuideCount}
              value={form.femaleGuideCount}
              onChange={(event) =>
                setForm({
                  ...form,
                  femaleGuideCount: Number(event.target.value),
                })
              }
              className={`${inputClass} mt-2`}
              aria-invalid={form.femaleGuideCount > form.totalGuideCount}
            />
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            POSH policy status
            <select
              value={form.posHPolicyStatus}
              onChange={(event) =>
                setForm({
                  ...form,
                  posHPolicyStatus: event.target
                    .value as typeof form.posHPolicyStatus,
                })
              }
              className={`${inputClass} mt-2`}
            >
              <option value="NOT_STARTED">Not started</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </label>
        </div>

        <div className="border-t border-line pt-5">
          <p className="font-display text-lg">Safety and participant care</p>
          <p className="mt-1 text-xs text-mist">
            These signals help travelers understand how your team prepares for
            safe, inclusive trips.
          </p>
        </div>
        <div className="rounded-[14px] border border-line bg-paper p-4">
          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.insuranceStatus}
              onChange={(event) =>
                setForm({ ...form, insuranceStatus: event.target.checked })
              }
              className="h-4 w-4 accent-forest"
            />
            Participant insurance is active
          </label>
          <AnimatePresence initial={false}>
          {form.insuranceStatus ? (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, height: "auto" }
              }
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={
                reduce ? { duration: 0 } : { duration: 0.28, ease: brandEase }
              }
              className="mt-4 grid gap-4 overflow-hidden"
            >
              <label className="text-xs font-bold text-mist">
                Insurance provider
              <input
                value={form.insuranceProvider}
                onChange={(event) =>
                  setForm({ ...form, insuranceProvider: event.target.value })
                }
                placeholder="Insurance provider"
                className={`${inputClass} mt-1.5`}
              />
              </label>
              <label className="text-xs font-bold text-mist">
                Coverage summary
              <textarea
                rows={3}
                value={form.insuranceDetails}
                onChange={(event) =>
                  setForm({ ...form, insuranceDetails: event.target.value })
                }
                placeholder="Coverage summary"
                className={`${inputClass} mt-1.5 resize-none`}
              />
              </label>
            </motion.div>
          ) : null}
          </AnimatePresence>
        </div>

        {validationError ? (
          <p className="flex items-center gap-2 rounded-lg bg-[#FFF7F5] p-3 text-xs font-semibold text-clay">
            <AlertCircle size={15} className="shrink-0" />
            {validationError}
          </p>
        ) : null}

        <Button onClick={save} disabled={saving || Boolean(validationError)}>
          {saving ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Saving securely…
            </>
          ) : (
            "Save and submit for review"
          )}
        </Button>
      </div>

      <aside className="h-fit rounded-[14px] border border-line bg-ink p-5 text-paper lg:sticky lg:top-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-amber" size={20} />
          <h2 className="font-display text-lg">Profile completion</h2>
        </div>
        <p className="mt-3 font-display text-4xl font-black">
          <motion.span
            key={completion}
            initial={reduce ? false : { opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={softSpring}
            className="inline-block"
          >
            {completion}%
          </motion.span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-amber"
            initial={false}
            animate={{ width: `${completion}%` }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.45, ease: brandEase }
            }
            role="progressbar"
            aria-label="Trust profile completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
          />
        </div>
        <div className="mt-5 space-y-3">
          {checks.map((check) => (
            <motion.div
              key={check.label}
              layout
              className="flex items-center gap-2 text-sm text-[#C9D2CB]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {check.done ? (
                  <motion.span
                    key="done"
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={softSpring}
                  >
                    <CheckCircle2 size={16} className="text-amber" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="todo"
                    initial={false}
                    animate={{ opacity: 1 }}
                  >
                    <Circle size={16} className="text-[#66766C]" />
                  </motion.span>
                )}
              </AnimatePresence>
              {check.label}
            </motion.div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-[#9DB0A4]">
          Saving sends changes for platform review. Operators cannot grant
          themselves a verified badge.
        </p>
      </aside>
    </div>
    </div>
  );
}
