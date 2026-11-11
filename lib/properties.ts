// Property types, option lists and formatting. Shared by server and client components.
// Option values mirror the PHP enums in backend/app/Enums; Laravel validates them.
import { CURRENCY } from "./config";

export type PropertyCategory =
  | "apartment"
  | "house"
  | "villa"
  | "townhouse"
  | "land"
  | "office"
  | "retail"
  | "warehouse";
export type PropertyPurpose = "sale" | "rent";
export type PropertyStatus = "available" | "under_offer" | "sold" | "rented" | "off_market";

export type Property = {
  id: number;
  title: string;
  description: string | null;
  category: PropertyCategory;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  price: number;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  cover_image_url?: string | null;
  images?: { id: number; url: string }[];
  created_by?: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
};

/** Laravel's paginated resource response. */
export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
};

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  townhouse: "Townhouse",
  land: "Land",
  office: "Office",
  retail: "Retail",
  warehouse: "Warehouse",
};

export const PURPOSE_LABELS: Record<PropertyPurpose, string> = {
  sale: "For sale",
  rent: "For rent",
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Available",
  under_offer: "Under offer",
  sold: "Sold",
  rented: "Rented",
  off_market: "Off market",
};

export const SORT_LABELS = {
  newest: "Newest first",
  oldest: "Oldest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
} as const;

/** Badge colour for each status (see .badge--* in globals.css). */
export const STATUS_TONES: Record<PropertyStatus, "success" | "warning" | "neutral" | "info"> = {
  available: "success",
  under_offer: "warning",
  sold: "neutral",
  rented: "info",
  off_market: "neutral",
};

/** Turn a label map into <select> options. */
export function toOptions<K extends string>(labels: Record<K, string>) {
  return (Object.entries(labels) as [K, string][]).map(([value, label]) => ({ value, label }));
}

const priceFormat = new Intl.NumberFormat("en", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

/** "$320,000" */
export function formatMoney(amount: number) {
  return priceFormat.format(amount);
}

/** "$1,450 / month" for rentals, "$320,000" for sales. */
export function formatPrice(property: Pick<Property, "price" | "purpose">) {
  const amount = priceFormat.format(property.price);
  return property.purpose === "rent" ? `${amount} / month` : amount;
}

// ---------------------------------------------------------------------------
// Search & filters (URL search params <-> API query string)
// ---------------------------------------------------------------------------

export const FILTER_KEYS = ["q", "purpose", "category", "status", "min_price", "max_price", "sort", "page"] as const;
export type PropertyFilters = Partial<Record<(typeof FILTER_KEYS)[number], string>>;

const ALLOWED_VALUES: Partial<Record<keyof PropertyFilters, readonly string[]>> = {
  purpose: Object.keys(PURPOSE_LABELS),
  category: Object.keys(CATEGORY_LABELS),
  status: Object.keys(STATUS_LABELS),
  sort: Object.keys(SORT_LABELS),
};
const NUMERIC_KEYS: (keyof PropertyFilters)[] = ["min_price", "max_price", "page"];

/** Keep only known, well-formed filters from the page's search params; drop the rest. */
export function parseFilters(searchParams: Record<string, string | string[] | undefined>): PropertyFilters {
  const filters: PropertyFilters = {};
  for (const key of FILTER_KEYS) {
    const raw = searchParams[key];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (!value) continue;
    if (ALLOWED_VALUES[key] && !ALLOWED_VALUES[key].includes(value)) continue;
    if (NUMERIC_KEYS.includes(key) && !/^\d+(\.\d+)?$/.test(value)) continue;
    filters[key] = key === "q" ? value.slice(0, 100) : value;
  }
  return filters;
}

/** "?q=loft&purpose=rent" (or "" when empty). */
export function toQueryString(filters: PropertyFilters) {
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  return query ? `?${query}` : "";
}
