import Link from "next/link";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkEnabled } from "@/lib/auth";

type OperatorSignInPageProps = {
  searchParams: { error?: string };
};

export default function OperatorSignInPage({
  searchParams,
}: OperatorSignInPageProps) {
  const notOperator = searchParams.error === "not_operator";

  if (!isClerkEnabled()) {
    redirect("/operator");
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-24">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <Logo size={30} />
          <span className="font-display text-lg font-bold">Bhraman</span>
        </Link>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-deep">
            Operator portal
          </span>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            Sign in to your dashboard
          </h1>
          <p className="mt-2 text-sm text-mist">
            Manage listings, availability, bookings, and payouts.
          </p>
        </div>

        {notOperator ? (
          <div className="mb-5 rounded-[14px] border border-clay/30 bg-[#F7E4DF] px-4 py-3 text-sm text-clay">
            This account is not registered as an operator. Use a verified operator
            email or{" "}
            <Link href="/become-operator" className="font-semibold underline">
              apply to partner
            </Link>
            .
          </div>
        ) : null}

        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/operator/sign-in"
          signUpUrl="/operator/sign-up"
          forceRedirectUrl="/operator"
          fallbackRedirectUrl="/operator"
        />

        <p className="mt-6 text-center text-sm text-mist">
          Booking a trip?{" "}
          <Link href="/sign-in" className="font-semibold text-amber-deep">
            Traveler sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
