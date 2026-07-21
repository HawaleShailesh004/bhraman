import { getSessionTraveler } from "@/lib/auth";
import { getTravelerUpdatesFeed } from "@/lib/traveler-updates";

export async function GET() {
  const session = await getSessionTraveler();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getTravelerUpdatesFeed(session.userId);
  return Response.json(items);
}
