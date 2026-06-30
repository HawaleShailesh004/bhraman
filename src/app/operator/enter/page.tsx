import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OperatorPortalGateClient } from "@/components/operator/operator-portal-gate";
import { getSessionOperator, isClerkEnabled } from "@/lib/auth";

export default async function OperatorEnterPage() {
  if (!isClerkEnabled()) {
    redirect("/operator");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/operator/sign-in");
  }

  const session = await getSessionOperator();
  if (session) {
    redirect("/operator");
  }

  return <OperatorPortalGateClient />;
}
