"use client";
// "Add a note" box above a lead's timeline. Clears after a successful save.
import { LoaderCircle, Send } from "lucide-react";
import { Alert } from "./Alert";
import { Field } from "./Field";
import { useFormAction } from "./useFormAction";
import type { FormAction } from "@/lib/forms";

export function LeadNoteForm({ action }: { action: FormAction }) {
  const { state, errors, pending, onSubmit, formRef } = useFormAction(action, { resetOnSuccess: true });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="form note-form">
      {state.message && !errors.body && <Alert>{state.message}</Alert>}
      <Field label="Add a note" name="body" errors={errors.body}>
        <textarea id="body" name="body" rows={3} maxLength={5000} required placeholder="Called back, booked a viewing, sent the brochure…" />
      </Field>
      <button type="submit" className="button button--secondary button--sm" disabled={pending}>
        {pending ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        {pending ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}
