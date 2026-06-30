import { redirect } from "next/navigation";
import { getSessionTraveler } from "@/lib/auth";
import { BookingFlowUi } from "@/components/booking/booking-flow-ui";
import { getListingDetail } from "@/lib/listings";

export const dynamic = "force-dynamic";

type BookPageProps = {
  params: { slug: string };
};

export default async function BookPage({ params }: BookPageProps) {
  const listing = await getListingDetail(params.slug);
  if (!listing) redirect("/discover");

  const traveler = await getSessionTraveler();

  return (
    <main className="min-h-screen bg-paper">
      <BookingFlowUi listing={listing} traveler={traveler} />
    </main>
  );
}
