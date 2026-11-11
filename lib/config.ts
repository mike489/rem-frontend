// Central place for frontend configuration read from environment variables.
// Set these in .env.local (see .env.example).

export const API_URL = process.env.NEXT_API_URL ?? "http://localhost:8000/api";

// ISO 4217 code used to display property prices, e.g. "USD", "EUR", "ETB".
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";

// IANA time zone for showing dates and visit times, e.g. "Africa/Addis_Ababa".
// Unset = the zone of the machine (server or browser) doing the rendering.
export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE || undefined;

// Name of the httpOnly cookie that holds the Sanctum API token.
export const AUTH_COOKIE = "auth_token";

// How long the auth cookie lives in the browser (seconds). 7 days.
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
