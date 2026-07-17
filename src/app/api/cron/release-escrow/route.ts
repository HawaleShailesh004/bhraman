import { releaseEligibleEscrow } from "@/lib/escrow";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await releaseEligibleEscrow();
  return Response.json(result);
}
