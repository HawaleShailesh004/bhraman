import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BecomeOperatorPageContent } from "@/components/marketing/become-operator-page-content";

export const metadata: Metadata = {
  title: "Become an operator | Bhraman",
  description:
    "List your Maharashtra adventure experiences on Bhraman. Reach travelers, earn a verified badge, and get paid after trips run.",
};

export default function BecomeOperatorPage() {
  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar onDark />
      <BecomeOperatorPageContent />
      <Footer />
    </main>
  );
}
