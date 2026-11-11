"use client";
// Sign-in form. Posts JSON to our own Next.js route handler (/api/login),
// which calls Laravel and sets the httpOnly token cookie server-side.
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";

/** Laravel validation errors: { field: ["message", ...] }. */
type FieldErrors = Record<string, string[]>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });

      if (res.ok) {
        // Only allow internal redirects ("/something"), never "//evil.com".
        const next = searchParams.get("next");
        const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
        // Full page load (not router.push) so every server component renders fresh with
        // the new auth cookie, and no stale client-side cache from the logged-out state is reused.
        window.location.assign(target);
        return; // keep the button in its loading state while navigating
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setFormError("Too many attempts. Please wait a minute and try again.");
      } else if (data.errors) {
        setFieldErrors(data.errors);
      } else {
        setFormError(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {formError && <Alert>{formError}</Alert>}

      <Field label="Email address" name="email" errors={fieldErrors.email}>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </Field>

      <Field
        label="Password"
        name="password"
        errors={fieldErrors.password}
        trailing={
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      >
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          placeholder="Your password"
        />
      </Field>

      <button type="submit" className="button button--primary" disabled={submitting}>
        {submitting && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting && <ArrowUpRight size={18} aria-hidden="true" />}
      </button>
    </form>
  );
}
