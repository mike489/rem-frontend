"use server";
// Server Actions for visits. They forward the form to Laravel with the user's token;
// Laravel validates the data and enforces who may see/change each visit (VisitPolicy).
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { apiSubmit } from "@/lib/auth";
import { fromDateTimeInput } from "@/lib/dates";
import { formToJson, isId, type FormState } from "@/lib/forms";
import type { Visit } from "@/lib/visits";

const FIELDS = ["lead_id", "property_id", "status", "scheduled_at", "agent_id", "notes"];

/** The form's local date/time -> UTC ISO. An unreadable value is passed on for Laravel to reject. */
function visitBody(formData: FormData) {
  const body = formToJson(formData, FIELDS);
  if (body.scheduled_at) body.scheduled_at = fromDateTimeInput(body.scheduled_at) ?? body.scheduled_at;
  return body;
}

/** Request or schedule a visit, then open it. */
export async function createVisit(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await apiSubmit<{ data: Visit }>("/visits", { method: "POST", body: JSON.stringify(visitBody(formData)) });
  if (!result.ok) return result.state;

  redirect(`/visits/${result.data.data.id}`);
}

/** Reschedule, change status/notes, or (admins) the agent. */
export async function updateVisit(visitId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isId(visitId)) return { message: "Unknown visit." };

  const result = await apiSubmit(`/visits/${visitId}`, { method: "PATCH", body: JSON.stringify(visitBody(formData)) });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Visit updated." };
}

/** Add a note to the visit's lead, filed under this visit. */
export async function addVisitNote(leadId: number, visitId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isId(leadId) || !isId(visitId)) return { message: "Unknown visit." };

  const result = await apiSubmit(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body: String(formData.get("body") ?? ""), visit_id: visitId }),
  });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Note added." };
}

/** Delete a visit (admins), then go back to the list. */
export async function deleteVisit(visitId: number): Promise<FormState> {
  if (!isId(visitId)) return { message: "Unknown visit." };

  const result = await apiSubmit(`/visits/${visitId}`, { method: "DELETE" });
  if (!result.ok) return result.state;

  redirect("/visits");
}
