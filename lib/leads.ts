// Lead & contact types, labels and helpers. Shared by server and client components.
// Values mirror backend/app/Enums/LeadStage.php and LeadSource.php; Laravel validates them.
import type { BadgeTone } from "@/components/Badge";
import type { Deal } from "./deals";
import type { Visit } from "./visits";

export { formatDate, formatDateTime } from "./dates";

export type LeadStage = "new" | "contacted" | "viewing" | "negotiation" | "won" | "lost";
export type LeadSource = "website" | "phone" | "email" | "walk_in" | "referral" | "other";

export type ContactSummary = { id: number; name: string; email: string | null; phone: string | null };

export type LeadNote = {
  id: number;
  /** "note" = written by a person; "activity" = recorded automatically. */
  kind: "note" | "activity";
  body: string;
  user: { id: number; name: string } | null;
  /** Set when the entry is about one of the lead's visits or deals. */
  visit_id: number | null;
  deal_id: number | null;
  created_at: string;
};

export type Lead = {
  id: number;
  stage: LeadStage;
  source: LeadSource;
  message: string | null;
  contact: ContactSummary;
  property: { id: number; title: string; city: string } | null;
  assignee: { id: number; name: string } | null;
  notes?: LeadNote[];
  visits?: Visit[];
  deals?: Deal[];
  created_at: string;
  updated_at: string;
};

/** From GET /api/leads/options, for "which lead?" pickers. */
export type LeadOption = { id: number; name: string; stage: LeadStage; property_id: number | null; property_title: string | null };

export function toLeadOption(lead: Lead): LeadOption {
  return { id: lead.id, name: lead.contact.name, stage: lead.stage, property_id: lead.property?.id ?? null, property_title: lead.property?.title ?? null };
}

export type Contact = ContactSummary & {
  notes: string | null;
  created_at: string;
  updated_at: string;
  leads?: Lead[];
  leads_count?: number;
};

export const STAGES: LeadStage[] = ["new", "contacted", "viewing", "negotiation", "won", "lost"];

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  viewing: "Viewing",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const STAGE_TONES: Record<LeadStage, BadgeTone> = {
  new: "info",
  contacted: "warning",
  viewing: "warning",
  negotiation: "accent",
  won: "success",
  lost: "neutral",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  phone: "Phone",
  email: "Email",
  walk_in: "Walk-in",
  referral: "Referral",
  other: "Other",
};

// ---------------------------------------------------------------------------
// List filters (URL search params <-> API query string)
// ---------------------------------------------------------------------------

export type LeadFilters = { q?: string; stage?: string; assigned_to?: string; page?: string };

/** Keep only known, well-formed filters from the page's search params. */
export function parseLeadFilters(searchParams: Record<string, string | string[] | undefined>): LeadFilters {
  const get = (key: string) => {
    const raw = searchParams[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;
  };
  const filters: LeadFilters = {};
  const q = get("q");
  const stage = get("stage");
  const assigned = get("assigned_to");
  const page = get("page");
  if (q) filters.q = q.slice(0, 100);
  if (stage && (stage === "open" || STAGES.includes(stage as LeadStage))) filters.stage = stage;
  if (assigned && /^(me|unassigned|\d+)$/.test(assigned)) filters.assigned_to = assigned;
  if (page && /^\d+$/.test(page)) filters.page = page;
  return filters;
}

/** "?q=sara&stage=open" (or "" when empty). */
export function leadQuery(filters: LeadFilters) {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return query ? `?${query}` : "";
}
