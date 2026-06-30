import Link from "next/link";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkEnabled } from "@/lib/auth";

type SignInPageProps = {
  searchParams: { redirect_url?: string };
};

export default function TravelerSignInPage({ searchParams }: SignInPageProps) {
  const redirectUrl = searchParams.redirect_url || "/discover";

  if (!isClerkEnabled()) {
    redirect(redirectUrl);
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-24">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <Logo size={30} />
          <span className="font-display text-lg font-bold">Bhraman</span>
        </Link>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Sign in to book
          </h1>
          <p className="mt-2 text-sm text-mist">
            Save your trips, manage bookings, and checkout faster.
          </p>
        </div>
        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl={redirectUrl}
          fallbackRedirectUrl={redirectUrl}
        />
        <p className="mt-6 text-center text-sm text-mist">
          Running trips?{" "}
          <Link href="/operator/enter" className="font-semibold text-amber-deep">
            Operator sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
