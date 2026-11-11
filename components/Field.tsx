// Form field: label + control + optional hint and the first validation error.
// Works with <input>, <select> and <textarea>; style hooks live in globals.css (.field).
import type { ReactNode } from "react";

type Props = {
  label: string;
  /** id of the control, so the label is linked to it. */
  name: string;
  errors?: string[];
  hint?: ReactNode;
  /** Button shown inside the control on the right (e.g. show/hide password). */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({ label, name, errors, hint, trailing, className, children }: Props) {
  const error = errors?.[0];
  return (
    <div className={["field", error && "field--error", className].filter(Boolean).join(" ")}>
      <label htmlFor={name}>{label}</label>
      <div className={`field__control${trailing ? " field__control--trailing" : ""}`}>
        {children}
        {trailing}
      </div>
      {error ? <p className="field__error">{error}</p> : hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}
