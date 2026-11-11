"use client";
// "Delete" button: asks for confirmation, then calls a bound Server Action,
// e.g. <DeleteButton action={deleteProperty.bind(null, id)} confirmMessage="Delete …?" />.
// The action redirects on success, so getting a result back means it failed.
import { useState, useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import type { FormState } from "@/lib/forms";

type Props = {
  action: () => Promise<FormState>;
  confirmMessage: string;
  label?: string;
};

export function DeleteButton({ action, confirmMessage, label = "Delete" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      setError(result.message ?? "Couldn’t delete this.");
    });
  }

  return (
    <>
      <button type="button" className="button button--danger button--sm" onClick={handleClick} disabled={pending}>
        {pending ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
        {label}
      </button>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
