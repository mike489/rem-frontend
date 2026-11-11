"use client";
// Edit a contact's details and general notes (admins).
import { LoaderCircle } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";
import type { FormAction } from "@/lib/forms";
import type { Contact } from "@/lib/leads";

export function ContactForm({ action, contact }: { action: FormAction; contact: Contact }) {
  const { state, errors, pending, onSubmit } = useFormAction(action);

  return (
    <form key={contact.updated_at} onSubmit={onSubmit} className="form">
      {state.message && <Alert>{state.message}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Full name" name="name" errors={errors.name}>
        <input id="name" name="name" required maxLength={255} defaultValue={contact.name} />
      </Field>
      <Field label="Email" name="email" errors={errors.email}>
        <input id="email" name="email" type="email" maxLength={255} defaultValue={contact.email ?? ""} />
      </Field>
      <Field label="Phone" name="phone" errors={errors.phone}>
        <input id="phone" name="phone" type="tel" maxLength={30} defaultValue={contact.phone ?? ""} />
      </Field>
      <Field label="Notes" name="notes" errors={errors.notes} hint="Preferences, budget, best time to call…">
        <textarea id="notes" name="notes" rows={4} maxLength={5000} defaultValue={contact.notes ?? ""} />
      </Field>

      <button type="submit" className="button button--primary button--sm" disabled={pending}>
        {pending && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
        {pending ? "Saving…" : "Save contact"}
      </button>
    </form>
  );
}
