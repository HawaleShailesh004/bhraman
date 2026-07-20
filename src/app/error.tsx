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

export default function AppError({
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
        title={unavailable ? "Connection hiccup" : "Something went wrong"}
        description={
          unavailable
            ? "We can't reach the database right now. Try again in a moment."
            : "We couldn't load this page. Try again, or head back home."
        }
        reset={reset}
      />
    </main>
  );
}
