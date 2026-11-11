"use server";
// Server Actions for leads. They forward the form to Laravel with the user's token;
// Laravel validates the data and enforces who may see/change each lead (LeadPolicy).
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { apiSubmit } from "@/lib/auth";
import { formToJson as pick, isId, type FormState } from "@/lib/forms";
import type { Lead } from "@/lib/leads";

/** Log an inquiry as a new lead, then open it. */
export async function createLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const body = pick(formData, ["contact_id", "name", "email", "phone", "property_id", "source", "message", "assigned_to"]);

  const result = await apiSubmit<{ data: Lead }>("/leads", { method: "POST", body: JSON.stringify(body) });
  if (!result.ok) return result.state;

  redirect(`/leads/${result.data.data.id}`);
}

/** Change a lead's stage, source, property or (admins) assignee. */
export async function updateLead(leadId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isId(leadId)) return { message: "Unknown lead." };
  const body = pick(formData, ["stage", "source", "property_id", "assigned_to"]);

  const result = await apiSubmit(`/leads/${leadId}`, { method: "PATCH", body: JSON.stringify(body) });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Changes saved." };
}

/** Add a follow-up note to a lead. */
export async function addLeadNote(leadId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isId(leadId)) return { message: "Unknown lead." };

  const result = await apiSubmit(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body: String(formData.get("body") ?? "") }),
  });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Note added." };
}

/** Delete a lead (admins), then go back to the list. */
export async function deleteLead(leadId: number): Promise<FormState> {
  if (!isId(leadId)) return { message: "Unknown lead." };

  const result = await apiSubmit(`/leads/${leadId}`, { method: "DELETE" });
  if (!result.ok) return result.state;

  redirect("/leads");
}
