import { redirect } from "next/navigation";
import { BookingsClientUi } from "@/components/bookings/bookings-client-ui";
import { getSessionTraveler, isClerkEnabled } from "@/lib/auth";
import { getTravelerBookings } from "@/lib/bookings-read";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await getSessionTraveler();
  if (isClerkEnabled() && !session) {
    redirect("/sign-in?redirect_url=%2Fbookings");
  }

  if (!session) {
    redirect("/sign-in");
  }

  const bookings = await getTravelerBookings(session.userId);
  return <BookingsClientUi bookings={bookings} />;
}
