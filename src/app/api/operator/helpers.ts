import type { OperatorSession } from "@/types/auth";
import { getSessionOperator } from "@/lib/auth";
import {
  DatabaseUnavailableError,
  isDbConnectivityError,
  serviceUnavailableResponse,
} from "@/lib/db";

export async function requireOperatorSession(): Promise<OperatorSession | null> {
  try {
    return await getSessionOperator();
  } catch (error) {
    if (
      error instanceof DatabaseUnavailableError ||
      isDbConnectivityError(error)
    ) {
      throw new DatabaseUnavailableError();
    }
    throw error;
  }
}

/** Session loader that never throws - returns Response on auth/DB failure. */
export async function loadOperatorSession(): Promise<
  { session: OperatorSession } | { response: Response }
> {
  try {
    const session = await getSessionOperator();
    if (!session) {
      return {
        response: Response.json({ error: "UNAUTHORIZED" }, { status: 401 }),
      };
    }
    return { session };
  } catch (error) {
    if (
      error instanceof DatabaseUnavailableError ||
      isDbConnectivityError(error)
    ) {
      return { response: serviceUnavailableResponse() };
    }
    throw error;
  }
}
