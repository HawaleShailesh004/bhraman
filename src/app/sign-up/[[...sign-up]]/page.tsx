import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkEnabled } from "@/lib/auth";

type SignUpPageProps = {
  searchParams: { redirect_url?: string };
};

export default function TravelerSignUpPage({ searchParams }: SignUpPageProps) {
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-mist">
            Join Bhraman to discover and book verified adventures.
          </p>
        </div>
        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl={redirectUrl}
          fallbackRedirectUrl={redirectUrl}
        />
        <p className="mt-6 text-center text-sm text-mist">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-amber-deep">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
