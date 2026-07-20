import { loadOperatorSession } from "@/app/api/operator/helpers";
import { toApiErrorResponse } from "@/lib/api-errors";
import {
  commitBatchImport,
  parseRosterText,
  previewBatchImport,
  type ImportRow,
} from "@/lib/batch-import";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await loadOperatorSession();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      text?: unknown;
      rows?: unknown;
      commit?: unknown;
    };

    let rows: ImportRow[] = [];
    if (typeof body.text === "string") {
      rows = parseRosterText(body.text);
    } else if (Array.isArray(body.rows)) {
      rows = body.rows as ImportRow[];
    } else {
      return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }

    if (body.commit === true) {
      const result = await commitBatchImport(
        auth.session.operatorId,
        params.id,
        rows,
      );
      return Response.json(result);
    }

    const preview = await previewBatchImport(
      auth.session.operatorId,
      params.id,
      rows,
    );
    return Response.json(preview);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SLOT_NOT_FOUND") {
        return Response.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      if (error.message === "CAPACITY_EXCEEDED") {
        return Response.json({ error: "CAPACITY_EXCEEDED" }, { status: 409 });
      }
    }
    return (
      toApiErrorResponse(error) ??
      Response.json({ error: "IMPORT_FAILED" }, { status: 500 })
    );
  }
}
