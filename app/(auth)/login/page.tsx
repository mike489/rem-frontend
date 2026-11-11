import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { isRegistrationOpen } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="auth__heading">
        <h1>Property workspace</h1>
        <p>Sign in to manage your property inventory.</p>
      </div>

      {/* LoginForm reads ?next= from the URL, which needs a Suspense boundary. */}
      <Suspense>
        <LoginForm />
      </Suspense>

      <Suspense fallback={<AskAdmin />}>
        <AccountPrompt />
      </Suspense>
    </>
  );
}

function AskAdmin() {
  return <p className="auth__switch">Need an account? Ask your administrator to add you.</p>;
}

/** "Create an account" only while the database has no users (first admin); otherwise ask an admin. */
async function AccountPrompt() {
  if (!(await isRegistrationOpen())) return <AskAdmin />;
  return (
    <p className="auth__switch">
      New here? <Link href="/register">Create an account</Link>
    </p>
  );
}
