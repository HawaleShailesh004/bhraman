import { notFound } from "next/navigation";
import { CompareClient } from "@/components/compare/compare-client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPlaceCompareBundle } from "@/lib/compare";

export const dynamic = "force-dynamic";

export default async function ComparePlacePage({
  params,
}: {
  params: Promise<{ placeSlug: string }>;
}) {
  const { placeSlug } = await params;
  const bundle = await getPlaceCompareBundle(placeSlug);
  if (!bundle || bundle.listings.length < 2) notFound();

  return (
    <main className="overflow-x-clip bg-paper">
      <Navbar />
      <CompareClient bundle={bundle} />
      <Footer />
    </main>
  );
}
