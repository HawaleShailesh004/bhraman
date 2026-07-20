import "server-only";

/**
 * Shared DB resilience helpers.
 * Neon / pooler dropouts should degrade UI or return 503 - never uncaught RSC crashes.
 */

export class DatabaseUnavailableError extends Error {
  constructor(message = "DATABASE_UNAVAILABLE") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function isDbConnectivityError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const e = error as {
    name?: string;
    code?: string;
    message?: string;
  };

  const code = e.code ?? "";
  const name = e.name ?? "";
  const message = (e.message ?? "").toLowerCase();

  if (
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientRustPanicError"
  ) {
    return true;
  }

  // P1001 unreachable, P1002 timed out, P1017 server closed connection
  if (code === "P1001" || code === "P1002" || code === "P1017") {
    return true;
  }

  return (
    message.includes("can't reach database") ||
    message.includes("cannot reach database") ||
    message.includes("server has closed the connection") ||
    message.includes("connection reset") ||
    message.includes("connection timed out") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    (message.includes("connection") && message.includes("closed"))
  );
}

export function isPrismaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name ?? "";
  return (
    name.startsWith("PrismaClient") ||
    typeof (error as { clientVersion?: string }).clientVersion === "string"
  );
}

/** Re-throw connectivity failures as DatabaseUnavailableError; leave others alone. */
export function rethrowAsUnavailable(error: unknown): never {
  if (error instanceof DatabaseUnavailableError) throw error;
  if (isDbConnectivityError(error)) {
    console.error("[db] unavailable:", error);
    throw new DatabaseUnavailableError();
  }
  throw error;
}

/** Auth/session path: treat any Prisma failure as unavailable rather than crashing RSC. */
export function rethrowAuthDbFailure(error: unknown): never {
  if (error instanceof DatabaseUnavailableError) throw error;
  if (isDbConnectivityError(error) || isPrismaError(error)) {
    console.error("[auth/db] unavailable:", error);
    throw new DatabaseUnavailableError();
  }
  throw error;
}

export async function withDb<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    rethrowAsUnavailable(error);
  }
}

export async function withDbFallback<T>(
  query: () => Promise<T>,
  fallback: T | (() => T | Promise<T>),
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (isDbConnectivityError(error) || isPrismaError(error)) {
      console.error("[db] falling back:", error);
      return typeof fallback === "function"
        ? await (fallback as () => T | Promise<T>)()
        : fallback;
    }
    throw error;
  }
}

export function serviceUnavailableResponse(message?: string) {
  return Response.json(
    {
      error: "SERVICE_UNAVAILABLE",
      message:
        message ??
        "We're having trouble reaching the database. Please try again in a moment.",
    },
    { status: 503 },
  );
}
