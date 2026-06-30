import { CreateListingForm } from "@/components/operator/CreateListingForm";
import { OperatorListingManagerUi } from "@/components/operator/operator-dashboard-ui";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import {
  getOperatorCategories,
  getOperatorListings,
  getOperatorPlaces,
} from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperatorListingsPage() {
  const session = await getSessionOperator();
  if (!session) return null;

  const [listings, places, categories] = await Promise.all([
    getOperatorListings(session.operatorId),
    getOperatorPlaces(),
    getOperatorCategories(),
  ]);

  return (
    <>
      <OperatorPageHeader
        title="My listings"
        subtitle="Publish, pause, and manage the experiences travelers can book."
      />
      <div className="mb-8">
        <OperatorListingManagerUi listings={listings} />
      </div>
      <section>
        <h2 className="mb-4 font-display text-xl">Create listing</h2>
        <CreateListingForm places={places} categories={categories} />
      </section>
    </>
  );
}
