"use client";
// First-run sign-up form (creates the admin account). Posts JSON to our own Next.js
// route handler (/api/register), which calls Laravel and sets the httpOnly token cookie.
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";

/** Laravel validation errors: { field: ["message", ...] }. */
type FieldErrors = Record<string, string[]>;

export function RegisterForm() {
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });

      if (res.ok) {
        // Full page load so every server component renders fresh with the new auth cookie.
        window.location.assign("/");
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

  const toggle = (
    <button
      type="button"
      className="field__toggle"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="form">
      {formError && <Alert>{formError}</Alert>}

      <Field label="Full name" name="name" errors={fieldErrors.name}>
        <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" />
      </Field>

      <Field label="Email address" name="email" errors={fieldErrors.email}>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </Field>

      <Field label="Password" name="password" errors={fieldErrors.password} trailing={toggle}>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </Field>

      <Field label="Confirm password" name="password_confirmation" errors={fieldErrors.password_confirmation}>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
      </Field>

      <button type="submit" className="button button--primary" disabled={submitting}>
        {submitting && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
        {submitting ? "Creating account…" : "Create account"}
        {!submitting && <ArrowUpRight size={18} aria-hidden="true" />}
      </button>
    </form>
  );
}
