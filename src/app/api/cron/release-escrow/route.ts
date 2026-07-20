import { releaseEligibleEscrow } from "@/lib/escrow";
import { toApiErrorResponse } from "@/lib/api-errors";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await releaseEligibleEscrow();
    return Response.json(result);
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "CRON_FAILED" }, { status: 500 })
    );
  }
}
