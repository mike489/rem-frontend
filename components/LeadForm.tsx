"use client";
// "Log inquiry" form: who asked (new or existing contact), about which property, how it came in.
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";
import { createLead } from "@/app/(app)/leads/actions";
import { SOURCE_LABELS, type ContactSummary, type LeadSource } from "@/lib/leads";
import type { PropertyPurpose, PropertyStatus } from "@/lib/properties";

/** From GET /api/properties/options. */
export type PropertyOption = { id: number; title: string; city: string; price: number; purpose: PropertyPurpose; status: PropertyStatus };
export type UserOption = { id: number; name: string };

type Props = {
  properties: PropertyOption[];
  /** Admins pick an assignee; null for agents (their leads are assigned to themselves). */
  users: UserOption[] | null;
  /** Logging a new inquiry for an existing contact. */
  contact?: ContactSummary | null;
  defaultPropertyId?: number;
};

export function LeadForm({ properties, users, contact, defaultPropertyId }: Props) {
  const { state, errors, pending, onSubmit } = useFormAction(createLead);

  return (
    <form onSubmit={onSubmit} className="property-form" noValidate>
      {state.message && <Alert>{state.message}</Alert>}

      <section className="card form-section">
        <div className="card__header">
          <h2>Contact</h2>
          <p>{contact ? "This inquiry is added to an existing contact." : "Who is asking? If the email or phone matches an existing contact, the inquiry is added to them."}</p>
        </div>
        {contact ? (
          <>
            <input type="hidden" name="contact_id" value={contact.id} />
            <p>
              <strong>{contact.name}</strong>
              <span className="muted"> · {[contact.email, contact.phone].filter(Boolean).join(" · ")}</span>
            </p>
          </>
        ) : (
          <div className="form-grid">
            <Field label="Full name" name="name" errors={errors.name}>
              <input id="name" name="name" required maxLength={255} autoComplete="off" />
            </Field>
            <Field label="Email" name="email" errors={errors.email}>
              <input id="email" name="email" type="email" maxLength={255} autoComplete="off" />
            </Field>
            <Field label="Phone" name="phone" errors={errors.phone} hint="Email, phone, or both.">
              <input id="phone" name="phone" type="tel" maxLength={30} autoComplete="off" />
            </Field>
          </div>
        )}
      </section>

      <section className="card form-section">
        <div className="card__header">
          <h2>Inquiry</h2>
        </div>
        <div className="form-grid">
          <Field label="Property" name="property_id" errors={errors.property_id} className="form-grid__wide">
            <select id="property_id" name="property_id" defaultValue={defaultPropertyId ?? ""}>
              <option value="">General inquiry (no specific property)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.city}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source" name="source" errors={errors.source}>
            <select id="source" name="source" defaultValue="phone">
              {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          {users && (
            <Field label="Assign to" name="assigned_to" errors={errors.assigned_to}>
              <select id="assigned_to" name="assigned_to" defaultValue="">
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Message" name="message" errors={errors.message} className="form-grid__full">
            <textarea id="message" name="message" rows={4} maxLength={5000} placeholder="What are they looking for? Budget, timing, questions…" />
          </Field>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={pending}>
          {pending && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
          {pending ? "Saving…" : "Save lead"}
        </button>
        <Link href="/leads" className="button button--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
