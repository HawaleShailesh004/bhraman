"use client";

import { ServiceErrorPanel } from "@/components/ui/service-error-panel";

export default function OperatorDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ServiceErrorPanel
      title="Something went wrong"
      description="We could not load this operator page. Try again, or return to overview."
      reset={reset}
      homeHref="/operator"
      homeLabel="Back to overview"
    />
  );
}
