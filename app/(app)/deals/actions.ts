"use server";
// Server Actions for deals. They forward the form to Laravel with the user's token;
// Laravel validates the data and enforces who may see/change each deal (DealPolicy).
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { apiSubmit } from "@/lib/auth";
import type { Deal } from "@/lib/deals";
import { formToJson, isId, type FormState } from "@/lib/forms";

const FIELDS = ["lead_id", "property_id", "status", "amount", "deposit", "agent_id", "notes"];

/** Open a deal (or record a booking), then show it. */
export async function createDeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await apiSubmit<{ data: Deal }>("/deals", { method: "POST", body: JSON.stringify(formToJson(formData, FIELDS)) });
  if (!result.ok) return result.state;

  redirect(`/deals/${result.data.data.id}`);
}

/** Move the deal along, change its terms, or (admins) the agent. */
export async function updateDeal(dealId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isId(dealId)) return { message: "Unknown deal." };

  const result = await apiSubmit(`/deals/${dealId}`, { method: "PATCH", body: JSON.stringify(formToJson(formData, FIELDS)) });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Deal updated." };
}

/** Add a note to the deal's lead, filed under this deal. */
export async function addDealNote(leadId: number, dealId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isId(leadId) || !isId(dealId)) return { message: "Unknown deal." };

  const result = await apiSubmit(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body: String(formData.get("body") ?? ""), deal_id: dealId }),
  });
  if (!result.ok) return result.state;

  refresh();
  return { success: "Note added." };
}

/** Delete a deal (admins), then go back to the list. */
export async function deleteDeal(dealId: number): Promise<FormState> {
  if (!isId(dealId)) return { message: "Unknown deal." };

  const result = await apiSubmit(`/deals/${dealId}`, { method: "DELETE" });
  if (!result.ok) return result.state;

  redirect("/deals");
}
