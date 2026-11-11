// Search box + filters for the property list. Submits as a GET to /properties, so the
// filters live in the URL (shareable, back button works). next/form navigates client-side.
import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  CATEGORY_LABELS,
  PURPOSE_LABELS,
  SORT_LABELS,
  STATUS_LABELS,
  toOptions,
  type PropertyFilters as Filters,
} from "@/lib/properties";

export function PropertyFilters({ filters }: { filters: Filters }) {
  const hasFilters = Object.keys(filters).some((key) => key !== "page" && key !== "sort");

  return (
    <Form action="/properties" className="filters card" role="search">
      <div className="filters__search field__control">
        <Search size={18} className="filters__search-icon" aria-hidden="true" />
        <input
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search by title, address or city"
          aria-label="Search properties"
        />
      </div>

      <div className="filters__row">
        <Select name="purpose" label="Purpose" value={filters.purpose} options={toOptions(PURPOSE_LABELS)} />
        <Select name="category" label="Category" value={filters.category} options={toOptions(CATEGORY_LABELS)} />
        <Select name="status" label="Status" value={filters.status} options={toOptions(STATUS_LABELS)} />
        <label className="filters__item">
          <span>Min price</span>
          <input name="min_price" type="number" min={0} inputMode="numeric" defaultValue={filters.min_price} placeholder="Any" />
        </label>
        <label className="filters__item">
          <span>Max price</span>
          <input name="max_price" type="number" min={0} inputMode="numeric" defaultValue={filters.max_price} placeholder="Any" />
        </label>
        <label className="filters__item">
          <span>Sort by</span>
          <select name="sort" defaultValue={filters.sort ?? "newest"}>
            {toOptions(SORT_LABELS).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filters__actions">
        <button type="submit" className="button button--primary button--sm">
          Apply filters
        </button>
        {hasFilters && (
          <Link href="/properties" className="button button--secondary button--sm">
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}

type SelectProps = {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
};

/** A filter dropdown with an "Any" option. */
function Select({ name, label, value, options }: SelectProps) {
  return (
    <label className="filters__item">
      <span>{label}</span>
      <select name={name} defaultValue={value ?? ""}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
