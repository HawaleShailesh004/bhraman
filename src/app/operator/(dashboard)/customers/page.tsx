import { UsersRound } from "lucide-react";
import { OperatorCustomersUi } from "@/components/operator/operator-customers-ui";
import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { getSessionOperator } from "@/lib/auth";
import { getOperatorCustomers } from "@/lib/operator";

export const dynamic = "force-dynamic";

export default async function OperatorCustomersPage() {
  const session = await getSessionOperator();
  if (!session) return null;
  const customers = await getOperatorCustomers(session.operatorId);

  return (
    <>
      <OperatorPageHeader
        title="Customers"
        subtitle="Completed-trip customers for your business. Medical and emergency details are excluded."
      />

      {customers.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-white p-12 text-center">
          <UsersRound className="mx-auto text-mist" />
          <h2 className="mt-3 font-display text-lg">No completed customers yet</h2>
          <p className="mt-1 text-sm text-mist">
            Customers appear here after their first completed trip.
          </p>
        </div>
      ) : (
        <OperatorCustomersUi customers={customers} />
      )}
    </>
  );
}
