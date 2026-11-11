"use client";
// Side panel on a deal: move it through Negotiating -> Booked -> Closed, change the terms,
// and (admins) the agent.
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import type { PropertyOption, UserOption } from "./LeadForm";
import { useFormAction } from "./useFormAction";
import { DEAL_STATUSES, DEAL_STATUS_HINTS, DEAL_STATUS_LABELS, type Deal, type DealStatus } from "@/lib/deals";
import type { FormAction } from "@/lib/forms";

type Props = {
  /** Bound Server Action: updateDeal.bind(null, deal.id). */
  action: FormAction;
  deal: Deal;
  properties: PropertyOption[];
  /** Admins can change the agent; null for agents. */
  users: UserOption[] | null;
};

export function DealUpdateForm({ action, deal, properties, users }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(action);
  const [status, setStatus] = useState<DealStatus>(deal.status);

  return (
    // key: show fresh values after a save re-renders the page with the updated deal.
    <form key={deal.updated_at} onSubmit={onSubmit} className="form">
      {state.message && <Alert>{state.message}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Status" name="status" errors={errors.status} hint={DEAL_STATUS_HINTS[status]}>
        <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as DealStatus)}>
          {DEAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {DEAL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={deal.type === "rent" ? "Agreed rent (per month)" : "Agreed price"} name="amount" errors={errors.amount}>
        <input id="amount" name="amount" type="number" min={0} step="any" inputMode="decimal" defaultValue={deal.amount} required />
      </Field>

      <Field label="Deposit" name="deposit" errors={errors.deposit}>
        <input id="deposit" name="deposit" type="number" min={0} step="any" inputMode="decimal" defaultValue={deal.deposit ?? ""} />
      </Field>

      {users && (
        <Field label="Agent" name="agent_id" errors={errors.agent_id}>
          <select id="agent_id" name="agent_id" defaultValue={deal.agent?.id ?? ""}>
            <option value="">Not decided yet</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {deal.property && (
        <Field label="Property" name="property_id" errors={errors.property_id}>
          <select id="property_id" name="property_id" defaultValue={deal.property.id}>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Terms / notes" name="notes" errors={errors.notes}>
        <textarea id="notes" name="notes" rows={4} maxLength={5000} defaultValue={deal.notes ?? ""} />
      </Field>

      <button type="submit" className="button button--primary button--sm" disabled={pending}>
        {pending && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
