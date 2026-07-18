import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HowItWorksPageContent } from "@/components/marketing/how-it-works-page-content";

export const metadata: Metadata = {
  title: "How it works | Bhraman",
  description:
    "Discover verified Maharashtra adventures, plan with AI, book with money held by Bhraman, and meet your operator on the ground.",
};

export default function HowItWorksPage() {
  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar onDark />
      <HowItWorksPageContent />
      <Footer />
    </main>
  );
}
