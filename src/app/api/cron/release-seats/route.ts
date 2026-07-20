import { releaseExpiredPendingBookings } from "@/lib/booking";
import { toApiErrorResponse } from "@/lib/api-errors";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await releaseExpiredPendingBookings(15);
    return Response.json(result);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "CRON_FAILED" }, { status: 500 })
    );
  }
}
