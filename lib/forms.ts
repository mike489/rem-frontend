// Shared form types (safe for server and client code).

/** Result of a form Server Action, shown by the form. Mirrors Laravel's 422 response. */
export type FormState = {
  /** Error banner text. */
  message?: string;
  /** Laravel validation errors: { field: ["message", ...] }. */
  errors?: Record<string, string[]>;
  /** Success banner text. */
  success?: string;
};

/** A Server Action used with useFormAction (see components/useFormAction.ts). */
export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Form fields -> JSON body for Laravel. Only fields present in the form are sent;
 * empty inputs become null so Laravel treats them as "not set".
 */
export function formToJson(formData: FormData, keys: string[]) {
  const body: Record<string, string | null> = {};
  for (const key of keys) {
    if (!formData.has(key)) continue;
    const value = String(formData.get(key) ?? "").trim();
    body[key] = value === "" ? null : value;
  }
  return body;
}

/** Positive integer id check for ids bound into Server Actions. */
export const isId = (id: number) => Number.isInteger(id) && id > 0;
