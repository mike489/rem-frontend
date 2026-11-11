// Team (admins only): who can sign in, with which role, and a form to add people.
import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { TeamMemberForm } from "@/components/TeamMemberForm";
import { apiGet, requireAdmin, type User } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <>
      <PageHeader title="Team" description="Admins manage properties and the team. Agents can view the inventory." />
      <Suspense fallback={<div className="card skeleton-block skeleton-block--panel" />}>
        <Team />
      </Suspense>
    </>
  );
}

async function Team() {
  const me = await requireAdmin();
  const users = await apiGet<User[]>("/users");

  return (
    <div className="team-grid">
      <section className="card">
        <div className="card__header">
          <h2>Members</h2>
          <p>
            {users.length} {users.length === 1 ? "person" : "people"} can sign in.
          </p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Added</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    {user.id === me.id && <span className="muted"> (you)</span>}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge tone={user.role === "admin" ? "accent" : "neutral"}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString("en", { dateStyle: "medium" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card__header">
          <h2>Add a team member</h2>
          <p>They sign in with this email and password.</p>
        </div>
        <TeamMemberForm />
      </section>
    </div>
  );
}
