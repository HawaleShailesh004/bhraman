import "server-only";

export type CancellationPolicy = {
  weatherRefundPct: number;
  cutoffHours: number;
  beforeCutoffPct: number;
  afterCutoffPct: number;
  noShowPct: number;
};

export function computeRefund(
  booking: { totalAmount: number; startTimeSnapshot: Date },
  policy: CancellationPolicy,
  reason: "USER" | "WEATHER"
) {
  if (reason === "WEATHER") {
    return Math.round((booking.totalAmount * policy.weatherRefundPct) / 100);
  }

  const hoursToStart =
    (booking.startTimeSnapshot.getTime() - Date.now()) / 3.6e6;
  const pct =
    hoursToStart >= policy.cutoffHours
      ? policy.beforeCutoffPct
      : policy.afterCutoffPct;

  return Math.round((booking.totalAmount * pct) / 100);
}
