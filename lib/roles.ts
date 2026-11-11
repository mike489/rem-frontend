// User roles. Mirrors App\Enums\UserRole in the Laravel backend, which enforces them on every request.
// Safe to import from client components (no server-only code here).

export type Role = "admin" | "agent";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  agent: "Agent",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Manages properties, leads, contacts and the team",
  agent: "Views the inventory and works their assigned leads",
};
