// POST /api/logout: revokes the token in Laravel, clears the cookie, redirects to /login.
// Used by a plain <form method="post"> in the header, so it works without client JS.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/config";

export async function POST(request: Request) {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (token) {
    // Best effort: even if the API is down, we still clear the local cookie.
    await laravelFetch("/logout", { method: "POST" }, token).catch(() => undefined);
  }

  // 303 so the browser follows the redirect with a GET.
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
