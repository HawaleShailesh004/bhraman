"use client";

import { useEffect, useState } from "react";
import { OperatorPageHeader } from "@/components/operator/operator-shell";

type OperatorCouponRow = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED_INR";
  discountValue: number;
  usedCount: number;
  maxUses: number | null;
  active: boolean;
};

export function OperatorCouponsClient() {
  const [coupons, setCoupons] = useState<OperatorCouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED_INR">(
    "PERCENT",
  );
  const [discountValue, setDiscountValue] = useState(10);
  const [maxUses, setMaxUses] = useState(100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/operator/coupons", {
        cache: "no-store",
      });
      const data = (await response.json()) as
        | OperatorCouponRow[]
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
            ? data.error
            : "Could not load coupons.",
        );
      }

      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setCoupons([]);
      setLoadError(
        err instanceof Error ? err.message : "Could not load coupons.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createCoupon(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/operator/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          maxUses,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create coupon");
      }
      setCode("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const response = await fetch("/api/operator/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    if (!response.ok) {
      setLoadError("Could not update coupon status.");
      return;
    }
    await load();
  }

  return (
    <>
      <OperatorPageHeader
        title="Coupons"
        subtitle="Share codes with travelers booking through Bhraman."
      />

      <form
        onSubmit={createCoupon}
        className="mb-8 grid gap-3 rounded-[16px] border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-mist">
            Code
          </span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="mt-1 w-full rounded-[12px] border border-line px-3 py-2 uppercase"
            placeholder="KOLAD10"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-mist">
            Type
          </span>
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as "PERCENT" | "FIXED_INR")
            }
            className="mt-1 w-full rounded-[12px] border border-line px-3 py-2"
          >
            <option value="PERCENT">Percent off</option>
            <option value="FIXED_INR">Fixed ₹ off</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-mist">
            Value
          </span>
          <input
            type="number"
            min={1}
            required
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            className="mt-1 w-full rounded-[12px] border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-mist">
            Max uses
          </span>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="mt-1 w-full rounded-[12px] border border-line px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[12px] bg-amber px-4 py-2.5 text-sm font-bold text-amber-text disabled:opacity-60"
          >
            Create coupon
          </button>
        </div>
        {error ? (
          <p className="sm:col-span-2 lg:col-span-5 text-sm text-clay">{error}</p>
        ) : null}
      </form>

      {loading ? (
        <p className="text-sm text-mist">Loading coupons…</p>
      ) : loadError ? (
        <div className="rounded-[14px] border border-clay/30 bg-[#FFF7F5] p-6 text-center">
          <p className="text-sm font-semibold text-clay">{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 text-sm font-bold text-amber-deep hover:underline"
          >
            Try again
          </button>
        </div>
      ) : coupons.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-line bg-white p-8 text-center text-sm text-mist">
          No coupons yet. Create one for Instagram or walk-in travelers.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-mist">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-line/70">
                  <td className="px-4 py-3 font-bold">{coupon.code}</td>
                  <td className="px-4 py-3">
                    {coupon.discountType === "PERCENT"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.active ? "Active" : "Paused"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void toggleActive(coupon.id, !coupon.active)}
                      className="text-xs font-bold text-amber-deep hover:underline"
                    >
                      {coupon.active ? "Pause" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
