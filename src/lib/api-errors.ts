import "server-only";

import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth";
import {
  DatabaseUnavailableError,
  isDbConnectivityError,
  serviceUnavailableResponse,
} from "@/lib/db";

/** Map known errors to API responses. Returns null if the caller should handle it. */
export function toApiErrorResponse(error: unknown): Response | null {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (
    error instanceof DatabaseUnavailableError ||
    isDbConnectivityError(error)
  ) {
    return serviceUnavailableResponse();
  }
  return null;
}

/** Last-resort mapper for route catch blocks. */
export function toApiErrorResponseOrInternal(error: unknown): Response {
  return (
    toApiErrorResponse(error) ??
    Response.json({ error: "INTERNAL" }, { status: 500 })
  );
}
