"use server";
// Server Actions for properties. They forward the form to Laravel with the user's token;
// Laravel validates the data and only allows admins to make these changes.
import { redirect } from "next/navigation";
import { apiSubmit } from "@/lib/auth";
import type { FormState } from "@/lib/forms";
import type { Property } from "@/lib/properties";

/** Create (propertyId = null) or update a property, then open its page. */
export async function saveProperty(
  propertyId: number | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (propertyId !== null && !Number.isInteger(propertyId)) return { message: "Unknown property." };

  const body = new FormData();
  for (const [key, value] of formData) {
    if (key.startsWith("$ACTION")) continue; // Next.js internals
    if (typeof value !== "string" && value.size === 0) continue; // empty file input
    body.append(key, value);
  }
  // HTML forms (and PHP) only parse multipart bodies on POST, so updates use method spoofing.
  if (propertyId !== null) body.append("_method", "PUT");

  const result = await apiSubmit<{ data: Property }>(
    propertyId === null ? "/properties" : `/properties/${propertyId}`,
    { method: "POST", body },
  );
  if (!result.ok) return result.state;

  redirect(`/properties/${result.data.data.id}`);
}

/** Delete a property, then go back to the list. */
export async function deleteProperty(propertyId: number): Promise<FormState> {
  if (!Number.isInteger(propertyId)) return { message: "Unknown property." };

  const result = await apiSubmit(`/properties/${propertyId}`, { method: "DELETE" });
  if (!result.ok) return result.state;

  redirect("/properties");
}
