import { OperatorPageHeader } from "@/components/operator/operator-shell";
import { OperatorVerificationForm } from "@/components/operator/operator-verification-form";
import { getSessionOperator } from "@/lib/auth";
import { getOperatorVerification } from "@/lib/operator";

export const dynamic = "force-dynamic";

export default async function OperatorVerificationPage() {
  const session = await getSessionOperator();
  if (!session) return null;
  const verification = await getOperatorVerification(session.operatorId);

  return (
    <>
      <OperatorPageHeader
        title="Trust & verification"
        subtitle="Complete your safety and business profile. Sensitive identifiers are never shown publicly."
      />
      <OperatorVerificationForm initial={verification} />
    </>
  );
}
