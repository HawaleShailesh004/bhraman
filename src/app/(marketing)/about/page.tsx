import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AboutPageContent } from "@/components/marketing/about-page-content";

export const metadata: Metadata = {
  title: "About us | Bhraman",
  description:
    "Bhraman is Maharashtra's trust-first adventure marketplace - verified operators, honest weather, and payments held until you're back.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar onDark />
      <AboutPageContent />
      <Footer />
    </main>
  );
}
