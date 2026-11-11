"use server";
// Server Action for the Team page. Laravel validates the data and only allows admins.
import { refresh } from "next/cache";
import { apiSubmit } from "@/lib/auth";
import type { FormState } from "@/lib/forms";

export async function addTeamMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields = ["name", "email", "role", "password"] as const;
  const body = Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")]));

  const result = await apiSubmit<{ name: string }>("/users", { method: "POST", body: JSON.stringify(body) });
  if (!result.ok) return result.state;

  refresh(); // re-render the team list with the new member
  return { success: `${result.data.name} can now sign in with the password you set.` };
}
