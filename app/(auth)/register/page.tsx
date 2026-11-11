import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RegisterForm } from "@/components/RegisterForm";
import { isRegistrationOpen } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

/** Sign-up only exists for the first account; once anyone exists, go to the login page. */
async function RegisterGate() {
  if (!(await isRegistrationOpen())) redirect("/login");
  return <RegisterForm />;
}

export default function RegisterPage() {
  return (
    <>
      <div className="auth__heading">
        <h1>Create your workspace</h1>
        <p>Set up the first account. It becomes the administrator.</p>
      </div>

      {/* The open/closed check calls the API, so it streams in behind a Suspense boundary. */}
      <Suspense>
        <RegisterGate />
      </Suspense>

      <p className="auth__switch">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
