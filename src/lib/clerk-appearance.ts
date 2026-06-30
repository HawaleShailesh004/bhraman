import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#E08A2B",
    colorText: "#1A2E22",
    colorTextSecondary: "#7C8A80",
    colorBackground: "#FAF8F3",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1A2E22",
    borderRadius: "12px",
    fontFamily: "system-ui, sans-serif",
  },
  elements: {
    card: "shadow-[var(--shadow-md)] border border-[#E2DCCE]",
    headerTitle: "font-display font-extrabold",
    headerSubtitle: "text-[#7C8A80]",
    formButtonPrimary:
      "bg-amber hover:bg-amber-deep text-[#3A2406] font-bold shadow-none",
    footerActionLink: "text-amber-deep font-semibold",
  },
};
