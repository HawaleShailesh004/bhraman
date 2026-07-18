import { Suspense } from "react";
import { PlannerClientUi } from "@/components/planner/planner-client-ui";

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-mist">
            Loading planner…
          </div>
        }
      >
        <PlannerClientUi />
      </Suspense>
    </main>
  );
}
