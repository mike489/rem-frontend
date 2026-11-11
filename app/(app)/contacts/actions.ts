"use server";
// Server Action for editing a contact (admins only; Laravel enforces it).
import { refresh } from "next/cache";
import { apiSubmit } from "@/lib/auth";
import type { FormState } from "@/lib/forms";

export async function updateContact(contactId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!Number.isInteger(contactId) || contactId <= 0) return { message: "Unknown contact." };

  const body = Object.fromEntries(
    ["name", "email", "phone", "notes"].map((key) => {
      const value = String(formData.get(key) ?? "").trim();
      return [key, value === "" ? null : value];
    }),
  );

  const result = await apiSubmit(`/contacts/${contactId}`, { method: "PUT", body: JSON.stringify(body) });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Contact saved." };
}
