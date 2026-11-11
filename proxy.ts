// Next.js Proxy (called "middleware" before Next 16). Runs before matching requests.
// Optimistic check only: it looks for the auth cookie, it does not validate the token.
// Laravel still verifies the token on every API call.
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/config";

// Pages anyone can see. Everything else matched below requires login.
// /register only works while there are no users (first admin); after that admins add
// team members on the Team page. Role checks happen in the pages (lib/auth.ts) and in Laravel.
const PUBLIC_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has(AUTH_COOKIE);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Not logged in, trying to open a protected page -> send to login, remember destination.
  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in, visiting the login page -> go to the dashboard.
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on pages only: skip API route handlers, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
