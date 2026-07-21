import { redirect } from "next/navigation";
import { TravelerUpdatesClient } from "@/components/bookings/traveler-updates-client";
import { getSessionTraveler, isClerkEnabled } from "@/lib/auth";
import { getTravelerUpdatesFeed } from "@/lib/traveler-updates";

export const dynamic = "force-dynamic";

export default async function BookingsUpdatesPage() {
  const session = await getSessionTraveler();
  if (isClerkEnabled() && !session) {
    redirect("/sign-in?redirect_url=%2Fbookings%2Fupdates");
  }
  if (!session) redirect("/sign-in");

  const items = await getTravelerUpdatesFeed(session.userId);
  return <TravelerUpdatesClient initialItems={items} />;
}
