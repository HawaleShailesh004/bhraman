"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function OperatorSignUpCompleteClient() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut(() => {
      router.replace("/operator/sign-in?registered=1");
    });
  }, [router, signOut]);

  return (
    <main className="min-h-screen bg-paper grid place-items-center px-6">
      <p className="text-sm text-mist">
        Account created - taking you to sign in…
      </p>
    </main>
  );
}
