"use client";
// "Create deal" form: which lead, which property, the agreed amount, and whether it's booked yet.
// Picking a lead preselects their property; picking a property fills in its listed price.
import { useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import type { PropertyOption, UserOption } from "./LeadForm";
import { useFormAction } from "./useFormAction";
import { createDeal } from "@/app/(app)/deals/actions";
import { DEAL_STATUS_HINTS } from "@/lib/deals";
import { STAGE_LABELS, type LeadOption } from "@/lib/leads";
import { STATUS_LABELS } from "@/lib/properties";

type Props = {
  leads: LeadOption[];
  /** Set when coming from a lead's page: the lead is fixed. */
  fixedLead?: LeadOption | null;
  properties: PropertyOption[];
  /** Admins pick the agent; null for agents (the deal is theirs). */
  users: UserOption[] | null;
  defaultAgentId?: number | null;
  cancelHref: string;
};

export function DealForm({ leads, fixedLead, properties, users, defaultAgentId, cancelHref }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(createDeal);
  const priceOf = (id: string) => properties.find((p) => String(p.id) === id)?.price;

  const initialProperty = fixedLead?.property_id ? String(fixedLead.property_id) : "";
  const [leadId, setLeadId] = useState(fixedLead ? String(fixedLead.id) : "");
  const [propertyId, setPropertyId] = useState(initialProperty);
  const [amount, setAmount] = useState(String(priceOf(initialProperty) ?? ""));
  const [status, setStatus] = useState<"negotiating" | "booked">("negotiating");
  const property = properties.find((p) => String(p.id) === propertyId);

  function chooseProperty(id: string) {
    setPropertyId(id);
    const price = priceOf(id);
    if (price !== undefined) setAmount(String(price));
  }

  function chooseLead(id: string) {
    setLeadId(id);
    const lead = leads.find((l) => String(l.id) === id);
    if (lead?.property_id) chooseProperty(String(lead.property_id));
  }

  return (
    <form onSubmit={onSubmit} className="property-form" noValidate>
      {state.message && <Alert>{state.message}</Alert>}

      <section className="card form-section">
        <div className="card__header">
          <h2>Deal</h2>
          <p>The sale or rental you’re agreeing with this customer.</p>
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

          <Field
            label="Property"
            name="property_id"
            errors={errors.property_id}
            className="form-grid__wide"
            hint={property && `${property.purpose === "rent" ? "Rental" : "Sale"} · currently ${STATUS_LABELS[property.status]}`}
          >
            <select id="property_id" name="property_id" value={propertyId} onChange={(e) => chooseProperty(e.target.value)} required>
              <option value="">Choose a property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.city}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={property?.purpose === "rent" ? "Agreed rent (per month)" : "Agreed price"}
            name="amount"
            errors={errors.amount}
            hint="Starts at the listed price."
          >
            <input id="amount" name="amount" type="number" min={0} step="any" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </Field>

          <Field label="Deposit (optional)" name="deposit" errors={errors.deposit}>
            <input id="deposit" name="deposit" type="number" min={0} step="any" inputMode="decimal" />
          </Field>

          <Field label="Status" name="status" errors={errors.status} hint={DEAL_STATUS_HINTS[status]}>
            <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="negotiating">Negotiating</option>
              <option value="booked">Booked</option>
            </select>
          </Field>

          {users && (
            <Field label="Agent" name="agent_id" errors={errors.agent_id}>
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

          <Field label="Terms / notes" name="notes" errors={errors.notes} className="form-grid__full">
            <textarea id="notes" name="notes" rows={3} maxLength={5000} placeholder="Payment plan, move-in date, conditions…" />
          </Field>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={pending}>
          {pending && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
          {pending ? "Saving…" : "Create deal"}
        </button>
        <Link href={cancelHref} className="button button--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
