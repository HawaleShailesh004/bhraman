import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OperatorUnauthorizedClient } from "@/components/operator/operator-unauthorized-client";
import { Logo } from "@/components/ui/logo";
import { getSessionOperator, isClerkEnabled } from "@/lib/auth";

export default async function OperatorUnauthorizedPage() {
  if (!isClerkEnabled()) {
    redirect("/operator/sign-in");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/operator/sign-in");
  }

  const session = await getSessionOperator();
  if (session) {
    redirect("/operator");
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-24">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <Logo size={30} />
          <span className="font-display text-lg font-bold">Bhraman</span>
        </Link>

        <OperatorUnauthorizedClient />
      </div>
    </main>
  );
}
