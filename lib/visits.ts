// Visit types, labels and list filters. Shared by server and client components.
// Values mirror backend/app/Enums/VisitStatus.php; Laravel validates them.
import type { BadgeTone } from "@/components/Badge";
import type { ContactSummary, LeadNote, LeadStage } from "./leads";

export type VisitStatus = "requested" | "scheduled" | "completed" | "cancelled" | "no_show";

/** The lead a visit or deal belongs to, as embedded in its API resource. */
export type LeadRef = { id: number; stage: LeadStage; assigned_to: number | null; contact: ContactSummary | null; created_at: string };

export type Visit = {
  id: number;
  status: VisitStatus;
  /** UTC ISO time; null while only requested. */
  scheduled_at: string | null;
  notes: string | null;
  lead?: LeadRef;
  property: { id: number; title: string; city: string; address: string } | null;
  agent: { id: number; name: string } | null;
  history?: LeadNote[];
  created_at: string;
  updated_at: string;
};

export const VISIT_STATUSES: VisitStatus[] = ["requested", "scheduled", "completed", "cancelled", "no_show"];

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const VISIT_STATUS_TONES: Record<VisitStatus, BadgeTone> = {
  requested: "warning",
  scheduled: "info",
  completed: "success",
  cancelled: "neutral",
  no_show: "neutral",
};

/** Scheduled, but the time has passed without anyone marking how it went. */
export function isOverdue(visit: Pick<Visit, "status" | "scheduled_at">, now = Date.now()) {
  return visit.status === "scheduled" && !!visit.scheduled_at && new Date(visit.scheduled_at).getTime() < now;
}

// ---------------------------------------------------------------------------
// List filters. "status" also takes "active" (requested + scheduled, the default view),
// "overdue" and "all".
// ---------------------------------------------------------------------------

export type VisitFilters = { q?: string; status?: string; agent_id?: string; page?: string };
const VISIT_STATUS_FILTERS = [...VISIT_STATUSES, "overdue", "all"];

export function parseVisitFilters(searchParams: Record<string, string | string[] | undefined>): VisitFilters {
  const get = (key: string) => {
    const raw = searchParams[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;
  };
  const filters: VisitFilters = {};
  const q = get("q");
  const status = get("status");
  const agent = get("agent_id");
  const page = get("page");
  if (q) filters.q = q.slice(0, 100);
  if (status && VISIT_STATUS_FILTERS.includes(status)) filters.status = status;
  if (agent && /^(me|unassigned|\d+)$/.test(agent)) filters.agent_id = agent;
  if (page && /^\d+$/.test(page)) filters.page = page;
  return filters;
}

/** Page URL query ("?status=completed"); undefined values are dropped. */
export function visitQuery(filters: VisitFilters) {
  const entries = Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][];
  const query = new URLSearchParams(entries).toString();
  return query ? `?${query}` : "";
}

/** API query: the default view is "active"; "all" means no status filter. */
export function visitApiQuery(filters: VisitFilters) {
  const status = filters.status === "all" ? undefined : (filters.status ?? "active");
  return visitQuery({ ...filters, status });
}
