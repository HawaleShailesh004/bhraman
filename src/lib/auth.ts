import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PRIMARY_OPERATOR_EMAIL } from "@/lib/operator-emails";
import { withDb, rethrowAsUnavailable, rethrowAuthDbFailure } from "@/lib/db";

export class ForbiddenError extends Error {
  constructor(message = "FORBIDDEN") {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "UNAUTHORIZED") {
    super(message);
  }
}

const DEFAULT_TRAVELER_EMAIL = "demo@bhraman.app";
const DEFAULT_OPERATOR_EMAIL = PRIMARY_OPERATOR_EMAIL;

export function isClerkEnabled() {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

import type {
  AdminSession,
  TravelerSession,
  OperatorSession,
} from "@/types/auth";

export type { AdminSession, TravelerSession, OperatorSession };

async function getDemoTraveler(): Promise<TravelerSession | null> {
  try {
    const user = await withDb(() =>
      prisma.user.findUnique({
        where: { email: DEFAULT_TRAVELER_EMAIL },
      }),
    );
    if (!user) return null;
    return { userId: user.id, email: user.email, name: user.name };
  } catch (error) {
    rethrowAuthDbFailure(error);
  }
}

async function getDemoOperator(): Promise<OperatorSession | null> {
  try {
    const email = process.env.OPERATOR_DEMO_EMAIL ?? DEFAULT_OPERATOR_EMAIL;
    const user = await withDb(() =>
      prisma.user.findUnique({
        where: { email },
        include: { operator: true },
      }),
    );
    if (!user?.operator) return null;
    return {
      userId: user.id,
      operatorId: user.operator.id,
      businessName: user.operator.businessName,
      email: user.email,
      logoUrl: user.operator.logoUrl,
      verificationStatus: user.operator.verificationStatus,
    };
  } catch (error) {
    rethrowAuthDbFailure(error);
  }
}

async function syncUserFromClerk() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    "Traveler";

  try {
    return await withDb(async () => {
      const existingByClerk = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { operator: true },
      });
      if (existingByClerk) return existingByClerk;

      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        include: { operator: true },
      });

      if (existingByEmail) {
        return prisma.user.update({
          where: { id: existingByEmail.id },
          data: { clerkId: userId, name: existingByEmail.name || name },
          include: { operator: true },
        });
      }

      return prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          role: UserRole.TRAVELER,
        },
        include: { operator: true },
      });
    });
  } catch (error) {
    rethrowAuthDbFailure(error);
  }
}

export async function getSessionTraveler(): Promise<TravelerSession | null> {
  if (!isClerkEnabled()) {
    return getDemoTraveler();
  }

  const user = await syncUserFromClerk();
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function requireSessionTraveler() {
  const session = await getSessionTraveler();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function getSessionOperator(): Promise<OperatorSession | null> {
  if (!isClerkEnabled()) {
    return getDemoOperator();
  }

  const user = await syncUserFromClerk();
  if (!user?.operator || user.role !== UserRole.OPERATOR) {
    return null;
  }

  return {
    userId: user.id,
    operatorId: user.operator.id,
    businessName: user.operator.businessName,
    email: user.email,
    logoUrl: user.operator.logoUrl,
    verificationStatus: user.operator.verificationStatus,
  };
}

export async function requireSessionOperator() {
  const session = await getSessionOperator();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function getSessionAdmin(): Promise<AdminSession | null> {
  if (!isClerkEnabled()) return null;
  const user = await syncUserFromClerk();
  if (!user || user.role !== UserRole.ADMIN) return null;
  return { userId: user.id, email: user.email, name: user.name };
}

export async function requireSessionAdmin() {
  const session = await getSessionAdmin();
  if (!session) throw new UnauthorizedError();
  return session;
}

export async function assertOwnsListing(userId: string, listingId: string) {
  try {
    const listing = await withDb(() =>
      prisma.listing.findUnique({
        where: { id: listingId },
        select: { operator: { select: { userId: true } } },
      }),
    );

    if (!listing || listing.operator.userId !== userId) {
      throw new ForbiddenError();
    }
  } catch (error) {
    if (error instanceof ForbiddenError) throw error;
    rethrowAsUnavailable(error);
  }
}

export async function assertOwnsBooking(userId: string, bookingId: string) {
  try {
    const booking = await withDb(() =>
      prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          listing: { select: { operator: { select: { userId: true } } } },
        },
      }),
    );

    if (!booking || booking.listing.operator.userId !== userId) {
      throw new ForbiddenError();
    }
  } catch (error) {
    if (error instanceof ForbiddenError) throw error;
    rethrowAsUnavailable(error);
  }
}

export async function assertOwnsBookingRef(userId: string, bookingRef: string) {
  try {
    const booking = await withDb(() =>
      prisma.booking.findUnique({
        where: { bookingRef },
        select: { userId: true },
      }),
    );

    if (!booking || booking.userId !== userId) {
      throw new ForbiddenError();
    }
  } catch (error) {
    if (error instanceof ForbiddenError) throw error;
    rethrowAsUnavailable(error);
  }
}
