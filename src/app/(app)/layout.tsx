import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AiConciergeDock } from "@/components/home/ai-concierge-dock";

export default function TravelerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <AiConciergeDock />
    </>
  );
}
