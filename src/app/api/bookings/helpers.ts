import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  requireSessionTraveler,
  UnauthorizedError,
  isClerkEnabled,
} from "@/lib/auth";
import { withDb, rethrowAuthDbFailure } from "@/lib/db";

const DEFAULT_TRAVELER_EMAIL = "demo@bhraman.app";

/** @deprecated Use requireSessionTraveler() - kept for demo fallback only */
export async function resolveTraveler(input?: {
  email?: string;
  name?: string;
}) {
  try {
    if (isClerkEnabled()) {
      const session = await requireSessionTraveler();
      if (input?.name?.trim()) {
        await withDb(() =>
          prisma.user.update({
            where: { id: session.userId },
            data: { name: input.name!.trim() },
          }),
        );
      }
      return withDb(() =>
        prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
      );
    }

    const email = input?.email?.trim() || DEFAULT_TRAVELER_EMAIL;
    const name = input?.name?.trim() || "Demo Traveler";

    return withDb(async () => {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return existing;

      return prisma.user.create({
        data: {
          email,
          name,
          role: UserRole.TRAVELER,
        },
      });
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    rethrowAuthDbFailure(error);
  }
}

export { UnauthorizedError };
