import { getListingAvailability } from "@/lib/availability";
import { toApiErrorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

type AvailabilityRouteProps = {
  params: { slug: string };
};

export async function GET(
  _request: Request,
  { params }: AvailabilityRouteProps,
) {
  try {
    const slots = await getListingAvailability(params.slug);
    return Response.json(slots, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "AVAILABILITY_FAILED" }, { status: 500 })
    );
  }
}
