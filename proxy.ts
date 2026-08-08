import { NextResponse, type NextRequest } from "next/server";

import {
  AuthRoutes,
  COOKIE_NAMES,
  DEFAULT_AUTH_REDIRECT,
  DEFAULT_UNAUTH_REDIRECT,
  PublicRoutes,
} from "@/lib/constants";

function isMatching(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = isMatching(pathname, AuthRoutes);
  const isPublicRoute = isMatching(pathname, PublicRoutes);
  const isExempt = isAuthRoute || isPublicRoute;

  const token = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const isAuthenticated = Boolean(token);

  // Authenticated users visiting auth-only pages are sent to the app.
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL(DEFAULT_AUTH_REDIRECT, request.nextUrl),
    );
  }

  // Unauthenticated users visiting protected pages are sent to login.
  if (!isExempt && !isAuthenticated) {
    const loginUrl = new URL(DEFAULT_UNAUTH_REDIRECT, request.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Run on every route except Next internals, API route handlers, and static
   * files.
   *
   * `opengraph-image` and `twitter-image` are generated metadata routes with
   * no file extension, so the `.*\..*` clause doesn't cover them. Without an
   * explicit exemption the auth check below redirects them to /login for any
   * unauthenticated fetch — which is every social crawler, so every link
   * preview would silently lose its image. (robots.txt and sitemap.xml are
   * already exempt via the extension clause.)
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
