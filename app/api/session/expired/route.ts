// GET /api/session/expired: pages send users here when Laravel rejects their token (expired/revoked).
// If the token really is invalid, the cookie is deleted so proxy.ts stops treating them as logged in;
// otherwise nothing changes. Either way the user ends up on the right page without a redirect loop.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/config";

export async function GET(request: Request) {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (token) {
    const res = await laravelFetch("/me", {}, token).catch(() => null);
    // Still valid (or the API is down, so we can't tell): keep the session.
    if (!res || res.status !== 401) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
