"use client";
// Side panel on a visit: status, time, property, notes, and (admins) the agent.
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import type { PropertyOption, UserOption } from "./LeadForm";
import { useFormAction } from "./useFormAction";
import { toDateTimeInput } from "@/lib/dates";
import type { FormAction } from "@/lib/forms";
import { VISIT_STATUSES, VISIT_STATUS_LABELS, type Visit } from "@/lib/visits";

type Props = {
  /** Bound Server Action: updateVisit.bind(null, visit.id). */
  action: FormAction;
  visit: Visit;
  properties: PropertyOption[];
  /** Admins can change the agent; null for agents. */
  users: UserOption[] | null;
};

export function VisitUpdateForm({ action, visit, properties, users }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(action);

  return (
    // key: show fresh values after a save re-renders the page with the updated visit.
    <form key={visit.updated_at} onSubmit={onSubmit} className="form">
      {state.message && <Alert>{state.message}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Status" name="status" errors={errors.status}>
        <select id="status" name="status" defaultValue={visit.status}>
          {VISIT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {VISIT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Date and time" name="scheduled_at" errors={errors.scheduled_at} hint="Needed once the visit is scheduled.">
        <input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={toDateTimeInput(visit.scheduled_at)} />
      </Field>

      {users && (
        <Field label="Agent" name="agent_id" errors={errors.agent_id}>
          <select id="agent_id" name="agent_id" defaultValue={visit.agent?.id ?? ""}>
            <option value="">Not decided yet</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Property" name="property_id" errors={errors.property_id}>
        <select id="property_id" name="property_id" defaultValue={visit.property?.id ?? ""}>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.city}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Notes" name="notes" errors={errors.notes}>
        <textarea id="notes" name="notes" rows={4} maxLength={5000} defaultValue={visit.notes ?? ""} placeholder="Preferred times, feedback after the visit…" />
      </Field>

      <button type="submit" className="button button--primary button--sm" disabled={pending}>
        {pending && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
