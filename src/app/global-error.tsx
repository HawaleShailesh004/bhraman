"use client";

import { ServiceErrorPanel } from "@/components/ui/service-error-panel";

/**
 * Catches failures in the root layout itself (must define html/body).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const unavailable =
    error.name === "DatabaseUnavailableError" ||
    error.message === "DATABASE_UNAVAILABLE";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#FAF8F3",
          color: "#14231B",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <ServiceErrorPanel
            unavailable={unavailable}
            title={unavailable ? "Connection hiccup" : "Something went wrong"}
            description={
              unavailable
                ? "We can't reach the database right now. Please try again."
                : "The app hit an unexpected error. Please try again."
            }
            reset={reset}
          />
        </main>
      </body>
    </html>
  );
}
