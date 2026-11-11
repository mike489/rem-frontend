"use client";
// Admin form to add a team member (admin or agent) with an initial password.
import { LoaderCircle, UserPlus } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";
import { addTeamMember } from "@/app/(app)/team/actions";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/roles";

export function TeamMemberForm() {
  const { state, errors, pending, onSubmit, formRef } = useFormAction(addTeamMember, { resetOnSuccess: true });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="form">
      {state.message && <Alert>{state.message}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Full name" name="name" errors={errors.name}>
        <input id="name" name="name" required autoComplete="off" placeholder="Jane Doe" />
      </Field>
      <Field label="Email address" name="email" errors={errors.email}>
        <input id="email" name="email" type="email" required autoComplete="off" placeholder="jane@company.com" />
      </Field>
      <Field label="Role" name="role" errors={errors.role}>
        <select id="role" name="role" defaultValue="agent">
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]} — {ROLE_DESCRIPTIONS[role]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Initial password" name="password" errors={errors.password} hint="At least 8 characters. Share it with them securely.">
        <input id="password" name="password" type="text" required minLength={8} autoComplete="new-password" />
      </Field>

      <button type="submit" className="button button--primary button--sm" disabled={pending}>
        {pending ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
        {pending ? "Adding…" : "Add team member"}
      </button>
    </form>
  );
}
