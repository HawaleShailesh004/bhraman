"use client";

import { ServiceErrorPanel } from "@/components/ui/service-error-panel";

function isUnavailable(error: Error) {
  const message = error.message.toLowerCase();
  return (
    error.name === "DatabaseUnavailableError" ||
    error.message === "DATABASE_UNAVAILABLE" ||
    message.includes("can't reach database") ||
    message.includes("cannot reach database") ||
    message.includes("database server")
  );
}

export default function OperatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const unavailable = isUnavailable(error);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-paper px-4 py-16">
      <ServiceErrorPanel
        unavailable={unavailable}
        title={
          unavailable
            ? "Operator tools temporarily offline"
            : "Operator page failed to load"
        }
        description={
          unavailable
            ? "We can't reach the database right now. Sign-in is fine - retry when the connection returns."
            : "We could not load this operator page. Try again, or return to overview."
        }
        reset={reset}
        homeHref="/operator"
        homeLabel="Back to overview"
      />
    </main>
  );
}
