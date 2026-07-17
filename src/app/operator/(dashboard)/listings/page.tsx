import { OperatorListingsClient } from "@/components/operator/operator-listings-ui";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import {
  getOperatorCategories,
  getOperatorListings,
  getOperatorPlaces,
} from "@/lib/operator";
import { getSessionOperator } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ListingsPageProps = {
  searchParams?: { tab?: string };
};

export default async function OperatorListingsPage({
  searchParams,
}: ListingsPageProps) {
  const session = await getSessionOperator();
  if (!session) return null;

  const [listings, places, categories] = await Promise.all([
    getOperatorListings(session.operatorId),
    getOperatorPlaces(),
    getOperatorCategories(),
  ]);

  const initialTab =
    searchParams?.tab === "create" ? ("create" as const) : ("listings" as const);

  return (
    <>
      <OperatorPageHeader
        title="My listings"
        subtitle="Publish, pause, and manage the experiences travelers can book."
      />
      <OperatorListingsClient
        listings={listings}
        places={places}
        categories={categories}
        initialTab={initialTab}
      />
    </>
  );
}
