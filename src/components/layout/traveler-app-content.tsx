"use client";

import { useAiConciergeDockVisible } from "@/components/home/ai-concierge-dock";

export function TravelerAppContent({ children }: { children: React.ReactNode }) {
  const dockVisible = useAiConciergeDockVisible();

  return (
    <div
      className={`w-full min-w-0 max-w-full overflow-x-clip ${
        dockVisible ? "pb-dock-safe md:pb-0" : ""
      }`}
    >
      {children}
    </div>
  );
}
