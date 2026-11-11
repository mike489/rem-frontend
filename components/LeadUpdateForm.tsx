"use client";
// Side panel on a lead: move it through the pipeline, and (admins) reassign it.
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import type { PropertyOption, UserOption } from "./LeadForm";
import { useFormAction } from "./useFormAction";
import type { FormAction } from "@/lib/forms";
import { SOURCE_LABELS, STAGES, STAGE_LABELS, type Lead, type LeadSource } from "@/lib/leads";

type Props = {
  /** Bound Server Action: updateLead.bind(null, lead.id). */
  action: FormAction;
  lead: Lead;
  properties: PropertyOption[];
  /** Admins can reassign; null for agents. */
  users: UserOption[] | null;
};

export function LeadUpdateForm({ action, lead, properties, users }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(action);

  return (
    // key: show fresh values after a save re-renders the page with the updated lead.
    <form key={lead.updated_at} onSubmit={onSubmit} className="form">
      {state.message && <Alert>{state.message}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Stage" name="stage" errors={errors.stage}>
        <select id="stage" name="stage" defaultValue={lead.stage}>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      {users && (
        <Field label="Assigned agent" name="assigned_to" errors={errors.assigned_to}>
          <select id="assigned_to" name="assigned_to" defaultValue={lead.assignee?.id ?? ""}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Property" name="property_id" errors={errors.property_id}>
        <select id="property_id" name="property_id" defaultValue={lead.property?.id ?? ""}>
          <option value="">General inquiry</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.city}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Source" name="source" errors={errors.source}>
        <select id="source" name="source" defaultValue={lead.source}>
          {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <button type="submit" className="button button--primary button--sm" disabled={pending}>
        {pending && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
