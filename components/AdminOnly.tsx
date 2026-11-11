// Renders its children only for admins (e.g. "Add property", "Edit", "Delete" buttons).
// Reads the session, so place it inside a <Suspense> boundary.
// This only hides UI; Laravel rejects admin-only requests from agents regardless.
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";

export async function AdminOnly({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return user?.role === "admin" ? children : null;
}
