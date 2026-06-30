import { getListingAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

type AvailabilityRouteProps = {
  params: { slug: string };
};

export async function GET(_request: Request, { params }: AvailabilityRouteProps) {
  const slots = await getListingAvailability(params.slug);
  return Response.json(slots, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
