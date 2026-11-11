"use client";
// "Schedule visit" form: which lead, which property, when, and who shows it.
// Picking a lead preselects the property they asked about.
import { useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import type { PropertyOption, UserOption } from "./LeadForm";
import { useFormAction } from "./useFormAction";
import { createVisit } from "@/app/(app)/visits/actions";
import { STAGE_LABELS, type LeadOption } from "@/lib/leads";

type Props = {
  /** The leads to pick from (unused when fixedLead is set). */
  leads: LeadOption[];
  /** Set when coming from a lead's page: the lead is fixed. */
  fixedLead?: LeadOption | null;
  properties: PropertyOption[];
  /** Admins pick the agent; null for agents (they show their own visits). */
  users: UserOption[] | null;
  /** The lead's agent, preselected for admins. */
  defaultAgentId?: number | null;
  cancelHref: string;
};

export function VisitForm({ leads, fixedLead, properties, users, defaultAgentId, cancelHref }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(createVisit);
  const [leadId, setLeadId] = useState(fixedLead ? String(fixedLead.id) : "");
  const [propertyId, setPropertyId] = useState(fixedLead?.property_id ? String(fixedLead.property_id) : "");
  const [status, setStatus] = useState<"scheduled" | "requested">("scheduled");

  function chooseLead(id: string) {
    setLeadId(id);
    const lead = leads.find((l) => String(l.id) === id);
    if (lead?.property_id) setPropertyId(String(lead.property_id));
  }

  return (
    <form onSubmit={onSubmit} className="property-form" noValidate>
      {state.message && <Alert>{state.message}</Alert>}

      <section className="card form-section">
        <div className="card__header">
          <h2>Visit</h2>
          <p>A viewing of one property with a customer.</p>
        </div>
        <div className="form-grid">
          {fixedLead ? (
            <div className="field form-grid__wide">
              <span className="field__label">Customer</span>
              <input type="hidden" name="lead_id" value={fixedLead.id} />
              <p>
                <strong>{fixedLead.name}</strong>
                <span className="muted"> · {STAGE_LABELS[fixedLead.stage]} lead</span>
              </p>
            </div>
          ) : (
            <Field label="Customer (lead)" name="lead_id" errors={errors.lead_id} className="form-grid__wide">
              <select id="lead_id" name="lead_id" value={leadId} onChange={(e) => chooseLead(e.target.value)} required>
                <option value="">Choose a lead…</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.property_title ? ` — ${l.property_title}` : ""} ({STAGE_LABELS[l.stage]})
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Property" name="property_id" errors={errors.property_id} className="form-grid__wide">
            <select id="property_id" name="property_id" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required>
              <option value="">Choose a property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.city}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status" name="status" errors={errors.status}>
            <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="scheduled">Scheduled — time agreed</option>
              <option value="requested">Requested — time not agreed yet</option>
            </select>
          </Field>

          <Field
            label={status === "scheduled" ? "Date and time" : "Date and time (optional)"}
            name="scheduled_at"
            errors={errors.scheduled_at}
          >
            <input id="scheduled_at" name="scheduled_at" type="datetime-local" required={status === "scheduled"} />
          </Field>

          {users && (
            <Field label="Agent" name="agent_id" errors={errors.agent_id} hint="Who shows the property.">
              <select id="agent_id" name="agent_id" defaultValue={defaultAgentId ?? ""}>
                <option value="">Not decided yet</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Notes" name="notes" errors={errors.notes} className="form-grid__full">
            <textarea id="notes" name="notes" rows={3} maxLength={5000} placeholder="Preferred times, who is coming, keys, parking…" />
          </Field>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={pending}>
          {pending && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
          {pending ? "Saving…" : status === "scheduled" ? "Schedule visit" : "Save request"}
        </button>
        <Link href={cancelHref} className="button button--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
