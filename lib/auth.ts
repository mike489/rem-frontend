// Server-only helpers for the auth cookie, the current user and calling the Laravel API.
// Laravel is the authority on permissions; the checks here only decide what UI to show.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { API_URL, AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "./config";
import type { FormState } from "./forms";
import type { Role } from "./roles";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

/** Where to send someone whose cookie holds an expired or revoked token (clears the cookie). */
const SESSION_EXPIRED_URL = "/api/session/expired";

/** Thrown when the Laravel API can't be reached or fails; shown by app/(app)/error.tsx. */
export class ApiError extends Error {
  constructor(message = "The API server is unavailable.") {
    super(message);
    this.name = "ApiError";
  }
}

/** Call the Laravel API from the server. Pass a FormData body for file uploads. */
export function laravelFetch(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  // FormData sets its own multipart Content-Type (with boundary); only JSON strings need one.
  if (typeof init.body === "string") headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
}

/** The API token from the httpOnly cookie, if any. */
export async function getToken() {
  return (await cookies()).get(AUTH_COOKIE)?.value;
}

/** Store the token in an httpOnly cookie so client-side JavaScript can never read it. */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

/**
 * The logged-in user (via GET /api/me), or null when there is no valid session.
 * Throws ApiError if the backend is down, so an outage isn't mistaken for "logged out".
 * Wrapped in React cache() so several components can call it while the API is hit once per request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;

  let res: Response;
  try {
    res = await laravelFetch("/me", {}, token);
  } catch {
    throw new ApiError();
  }
  if (res.status === 401) return null;
  if (!res.ok) throw new ApiError();
  return (await res.json()) as User;
});

/** The logged-in user; sends visitors without a valid session to the login page. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(SESSION_EXPIRED_URL);
  return user;
}

/** The logged-in admin; agents are sent back to the dashboard. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

/**
 * GET a JSON resource from Laravel as the logged-in user, for Server Components.
 * 401 -> login, 403 -> dashboard, 404 -> not-found page, other failures -> ApiError.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const token = await getToken();
  if (!token) redirect(SESSION_EXPIRED_URL);

  let res: Response;
  try {
    res = await laravelFetch(path, {}, token);
  } catch {
    throw new ApiError();
  }
  if (res.status === 401) redirect(SESSION_EXPIRED_URL);
  if (res.status === 403) redirect("/");
  if (res.status === 404) notFound();
  if (!res.ok) throw new ApiError(`API request failed (${res.status}).`);
  return (await res.json()) as T;
}

export type { FormState } from "./forms";

/**
 * Send a form to Laravel as the logged-in user (used by Server Actions).
 * Returns the parsed JSON on success, or a FormState with the error to show.
 */
export async function apiSubmit<T>(
  path: string,
  init: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; state: FormState }> {
  const token = await getToken();
  if (!token) redirect(SESSION_EXPIRED_URL);

  let res: Response;
  try {
    res = await laravelFetch(path, init, token);
  } catch {
    return { ok: false, state: { message: "Can't reach the API server. Please try again." } };
  }

  if (res.status === 401) redirect(SESSION_EXPIRED_URL);
  if (res.status === 204) return { ok: true, data: undefined as T };

  const data = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, data: data as T };
  if (res.status === 403) return { ok: false, state: { message: "You don't have permission to do this." } };
  if (res.status === 413) return { ok: false, state: { message: "The upload is too large." } };
  return {
    ok: false,
    state: {
      // Each field shows its own error, so the banner only needs a summary.
      message: data.errors
        ? "Please correct the highlighted fields."
        : (data.message ?? "Something went wrong. Please try again."),
      errors: data.errors,
    },
  };
}

/** Whether first-run sign-up is open (no users exist yet). False if the API can't be reached. */
export async function isRegistrationOpen(): Promise<boolean> {
  try {
    const res = await laravelFetch("/register");
    if (!res.ok) return false;
    return ((await res.json()) as { open?: boolean }).open === true;
  } catch {
    return false;
  }
}

/**
 * Handler for /api/login and /api/register: forwards the JSON body to Laravel,
 * and on success moves the token into the cookie and returns only the user.
 */
export async function forwardCredentials(request: Request, laravelPath: string) {
  let res: Response;
  try {
    res = await laravelFetch(laravelPath, {
      method: "POST",
      body: JSON.stringify(await request.json()),
    });
  } catch {
    return NextResponse.json({ message: "Cannot reach the API server." }, { status: 502 });
  }

  const data = await res.json();
  if (!res.ok) {
    // Pass validation (422) / throttling (429) errors straight through to the form.
    return NextResponse.json(data, { status: res.status });
  }

  // Return only the user — the token never reaches browser JavaScript.
  const response = NextResponse.json({ user: data.user }, { status: res.status });
  setAuthCookie(response, data.token);
  return response;
}
