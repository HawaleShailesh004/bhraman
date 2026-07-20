"use client";

import { ServiceErrorPanel } from "@/components/ui/service-error-panel";

function isUnavailable(error: Error) {
  const message = error.message.toLowerCase();
  return (
    error.name === "DatabaseUnavailableError" ||
    error.message === "DATABASE_UNAVAILABLE" ||
    message.includes("can't reach database") ||
    message.includes("database server")
  );
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const unavailable = isUnavailable(error);

  return (
    <ServiceErrorPanel
      unavailable={unavailable}
      title={
        unavailable
          ? "Admin tools temporarily offline"
          : "Admin page failed to load"
      }
      description={
        unavailable
          ? "We can't reach the database right now. No escrow actions were taken."
          : "Check your connection and try again. No escrow actions were taken."
      }
      reset={reset}
      homeHref="/"
      homeLabel="Go home"
    />
  );
}
