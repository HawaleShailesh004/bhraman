import type { Appearance } from "@clerk/types";

/** Branded Clerk chrome - Bhraman paper/ink/amber, no generic “My Application” vibe. */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#E08A2B",
    colorText: "#14231B",
    colorTextSecondary: "#3A4740",
    colorBackground: "#FAF8F3",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#14231B",
    borderRadius: "12px",
    fontFamily: "Satoshi, system-ui, sans-serif",
  },
  layout: {
    logoPlacement: "inside",
    socialButtonsPlacement: "top",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "shadow-[var(--shadow-md)] border border-[#E2DCCE] bg-[#FAF8F3]",
    headerTitle:
      "font-display text-[#14231B] text-xl font-medium tracking-tight",
    headerSubtitle: "text-[#3A4740] text-sm",
    socialButtonsBlockButton:
      "border border-[#E2DCCE] bg-white hover:bg-[#EDE6D8] text-[#14231B]",
    formFieldLabel: "text-[#14231B] text-xs font-semibold",
    formFieldInput:
      "border-[#E2DCCE] bg-white text-[#14231B] rounded-[12px] focus:border-[#E08A2B] focus:ring-[#E08A2B]/30",
    formButtonPrimary:
      "bg-[#E08A2B] hover:bg-[#C9741C] text-[#3A2406] font-bold shadow-none rounded-[12px]",
    footerActionLink: "text-[#C9741C] font-semibold hover:text-[#E08A2B]",
    identityPreviewText: "text-[#14231B]",
    identityPreviewEditButton: "text-[#C9741C]",
    dividerLine: "bg-[#E2DCCE]",
    dividerText: "text-[#3A4740]",
  },
};
