// Settings: shows the signed-in user's account details (read-only for now).
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

export const metadata: Metadata = { title: "Settings" };

async function AccountDetails() {
  const user = await requireUser();

  const memberSince = new Date(user.created_at).toLocaleDateString("en", { dateStyle: "long" });

  return (
    <dl className="details">
      <div>
        <dt>Full name</dt>
        <dd>{user.name}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </div>
      <div>
        <dt>Role</dt>
        <dd>
          {ROLE_LABELS[user.role]} <span className="muted">— {ROLE_DESCRIPTIONS[user.role]}</span>
        </dd>
      </div>
      <div>
        <dt>Member since</dt>
        <dd>{memberSince}</dd>
      </div>
    </dl>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your account and workspace preferences." />
      <section className="card">
        <div className="card__header">
          <h2>Account</h2>
          <p>Your sign-in details.</p>
        </div>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <AccountDetails />
        </Suspense>
      </section>
    </>
  );
}
