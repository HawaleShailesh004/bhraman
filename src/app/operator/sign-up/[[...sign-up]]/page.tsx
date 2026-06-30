import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkEnabled } from "@/lib/auth";

export default function OperatorSignUpPage() {
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
            Operator access
          </h1>
          <p className="mt-2 text-sm text-mist">
            Operator accounts are created after verification. Sign in if you
            already have access.
          </p>
        </div>

        <div className="mb-5 space-y-2 rounded-[14px] border border-line bg-white p-4 text-sm text-[#54635A]">
          {[
            "Use the email your operator profile was registered with",
            "New partners apply first — we verify within 48 hours",
            "Traveler accounts cannot access the operator dashboard",
          ].map((line) => (
            <div key={line} className="flex items-start gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-forest" />
              <span>{line}</span>
            </div>
          ))}
        </div>

        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/operator/sign-up"
          signInUrl="/operator/sign-in"
          forceRedirectUrl="/operator"
          fallbackRedirectUrl="/become-operator"
        />

        <p className="mt-6 text-center text-sm text-mist">
          Not an operator yet?{" "}
          <Link href="/become-operator" className="font-semibold text-amber-deep">
            Learn how to partner
          </Link>
        </p>
      </div>
    </main>
  );
}
