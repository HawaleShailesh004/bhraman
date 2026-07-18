import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OperatorShell } from "@/components/operator/operator-shell";
import { getSessionOperator, isClerkEnabled } from "@/lib/auth";

export default async function OperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isClerkEnabled()) {
    const { userId } = await auth();
    if (!userId) {
      redirect("/operator/sign-in");
    }

    const session = await getSessionOperator();
    if (!session) {
      redirect("/operator/unauthorized");
    }

    return (
      <OperatorShell
        businessName={session.businessName}
        logoUrl={session.logoUrl}
        verificationStatus={session.verificationStatus}
      >
        {children}
      </OperatorShell>
    );
  }

  const session = await getSessionOperator();
  if (!session) {
    redirect("/operator/sign-in");
  }

  return (
    <OperatorShell
      businessName={session.businessName}
      logoUrl={session.logoUrl}
      verificationStatus={session.verificationStatus}
    >
      {children}
    </OperatorShell>
  );
}
