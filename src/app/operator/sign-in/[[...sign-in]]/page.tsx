import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getSessionOperator, isClerkEnabled } from "@/lib/auth";
import { PRIMARY_OPERATOR_EMAIL } from "@/lib/operator-emails";

type OperatorSignInPageProps = {
  searchParams: { registered?: string };
};

export default async function OperatorSignInPage({
  searchParams,
}: OperatorSignInPageProps) {
  const justRegistered = searchParams.registered === "1";
  if (!isClerkEnabled()) {
    redirect("/operator");
  }

  const { userId } = await auth();
  if (userId) {
    const session = await getSessionOperator();
    if (session) {
      redirect("/operator");
    }
    redirect("/operator/unauthorized");
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

        {justRegistered ? (
          <div className="mb-5 rounded-[14px] border border-forest/30 bg-[#EAF1EC] px-4 py-3 text-sm text-forest">
            <p className="font-semibold">Account created successfully.</p>
            <p className="mt-1 text-[#33433A]">
              Sign in below with the same email and password to open your operator
              dashboard.
            </p>
          </div>
        ) : (
        <div className="mb-5 rounded-[14px] border border-amber/40 bg-[#FFF8EE] px-4 py-3 text-sm text-[#54635A] space-y-2">
          <p className="font-semibold text-ink">
            New here? You must sign up once before sign in works.
          </p>
          <p>
            Use{" "}
            <Link href="/operator/sign-up" className="font-semibold text-amber-deep">
              Sign up
            </Link>{" "}
            with your operator email, then sign in here.
          </p>
          <p>
            Demo:{" "}
            <code className="text-xs bg-paper px-1.5 py-0.5 rounded break-all">
              {PRIMARY_OPERATOR_EMAIL}
            </code>
            {" · "}
            verification code{" "}
            <code className="text-xs bg-paper px-1 rounded">424242</code> if asked
          </p>
        </div>
        )}

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
