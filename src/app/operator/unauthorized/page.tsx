import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/auth";

/** Signed-in travelers hitting /operator/* land here — send to switch flow */
export default async function OperatorUnauthorizedPage() {
  if (!isClerkEnabled()) {
    redirect("/operator/sign-in");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/operator/sign-in");
  }

  redirect("/operator/enter");
}
