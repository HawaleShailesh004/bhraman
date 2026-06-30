import { getSessionOperator } from "@/lib/auth";

export async function requireOperatorSession() {
  const session = await getSessionOperator();
  if (!session) {
    return null;
  }
  return session;
}
