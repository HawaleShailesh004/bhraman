import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

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
    </>
  );
}
