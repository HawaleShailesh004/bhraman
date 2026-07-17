import { AdminDisputesClient } from "@/components/admin/admin-disputes-client";
import { getAdminDisputes } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const disputes = await getAdminDisputes();

  return (
    <>
      <p className="eyebrow">Escrow operations</p>
      <h1 className="sec-title">Open disputes</h1>
      <p className="sec-sub">
        Review evidence before releasing escrow or initiating a Razorpay
        refund. Every action requires explicit confirmation.
      </p>

      <AdminDisputesClient disputes={disputes} />
    </>
  );
}
