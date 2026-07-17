import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isOperatorAuthRoute = createRouteMatcher([
  "/operator/sign-in(.*)",
  "/operator/sign-up(.*)",
  "/operator/unauthorized",
  "/operator/enter",
]);

const isOperatorAppRoute = createRouteMatcher([
  "/operator",
  "/operator/(.*)",
]);

const isTravelerProtectedRoute = createRouteMatcher([
  "/bookings(.*)",
  "/booking/(.*)",
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const clerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export default clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isTravelerProtectedRoute(req)) {
        await auth().protect({
          unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
        });
      }

      if (isOperatorAppRoute(req) && !isOperatorAuthRoute(req)) {
        await auth().protect({
          unauthenticatedUrl: new URL(
            "/operator/sign-in",
            req.url,
          ).toString(),
        });
      }

      if (isAdminRoute(req)) {
        await auth().protect({
          unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
        });
      }
    })
  : function middleware(_req: NextRequest) {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
