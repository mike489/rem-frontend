// Deal types, labels and list filters. Shared by server and client components.
// Values mirror backend/app/Enums/DealStatus.php; Laravel validates them.
import type { BadgeTone } from "@/components/Badge";
import type { LeadNote } from "./leads";
import { formatMoney, type PropertyPurpose, type PropertyStatus } from "./properties";
import type { LeadRef } from "./visits";

export type DealStatus = "negotiating" | "booked" | "closed" | "cancelled";

export type Deal = {
  id: number;
  /** From the property: a sale, or a rental (amount is per month). */
  type: PropertyPurpose;
  status: DealStatus;
  amount: number;
  deposit: number | null;
  notes: string | null;
  booked_at: string | null;
  closed_at: string | null;
  lead?: LeadRef;
  property: { id: number; title: string; city: string; price: number; purpose: PropertyPurpose; status: PropertyStatus } | null;
  agent: { id: number; name: string } | null;
  history?: LeadNote[];
  created_at: string;
  updated_at: string;
};

export const DEAL_STATUSES: DealStatus[] = ["negotiating", "booked", "closed", "cancelled"];

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  negotiating: "Negotiating",
  booked: "Booked",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const DEAL_STATUS_TONES: Record<DealStatus, BadgeTone> = {
  negotiating: "accent",
  booked: "warning",
  closed: "success",
  cancelled: "neutral",
};

/** What each status means, shown next to the status picker. */
export const DEAL_STATUS_HINTS: Record<DealStatus, string> = {
  negotiating: "Agreeing price and terms.",
  booked: "Reserved or deposit paid. The property is marked Under offer.",
  closed: "Signed. The lead is marked Won and the property Sold or Rented.",
  cancelled: "Fell through. A property held Under offer by this deal becomes Available again.",
};

/** "$1,450 / month" for rentals, "$320,000" for sales. */
export function formatDealAmount(deal: Pick<Deal, "amount" | "type">) {
  const amount = formatMoney(deal.amount);
  return deal.type === "rent" ? `${amount} / month` : amount;
}

// ---------------------------------------------------------------------------
// List filters. "status" also takes "active" (negotiating + booked).
// ---------------------------------------------------------------------------

export type DealFilters = { q?: string; status?: string; agent_id?: string; page?: string };

export function parseDealFilters(searchParams: Record<string, string | string[] | undefined>): DealFilters {
  const get = (key: string) => {
    const raw = searchParams[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;
  };
  const filters: DealFilters = {};
  const q = get("q");
  const status = get("status");
  const agent = get("agent_id");
  const page = get("page");
  if (q) filters.q = q.slice(0, 100);
  if (status && (status === "active" || DEAL_STATUSES.includes(status as DealStatus))) filters.status = status;
  if (agent && /^(me|unassigned|\d+)$/.test(agent)) filters.agent_id = agent;
  if (page && /^\d+$/.test(page)) filters.page = page;
  return filters;
}

/** "?status=booked" (or "" when empty); undefined values are dropped. */
export function dealQuery(filters: DealFilters) {
  const entries = Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][];
  const query = new URLSearchParams(entries).toString();
  return query ? `?${query}` : "";
}
