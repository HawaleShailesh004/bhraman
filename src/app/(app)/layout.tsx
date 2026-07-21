import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { TravelerAppContent } from "@/components/layout/traveler-app-content";
import { AiConciergeDock } from "@/components/home/ai-concierge-dock";

export default function TravelerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <TravelerAppContent>{children}</TravelerAppContent>
      <Footer />
      <AiConciergeDock />
    </>
  );
}
