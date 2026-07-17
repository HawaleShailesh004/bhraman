import { releaseExpiredPendingBookings } from "@/lib/booking";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await releaseExpiredPendingBookings(15);
  return Response.json(result);
}
