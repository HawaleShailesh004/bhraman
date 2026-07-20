import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import { getOperatorBatches } from "@/lib/batches";

export async function GET() {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const batches = await getOperatorBatches(auth.session.operatorId);
    return Response.json({ batches });
  } catch (error) {
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "LIST_FAILED" }, { status: 500 })
    );
  }
}
