// Compact search bar above a list: text search, optional agent filter (admins), Clear.
// A GET form (next/form), so the filters live in the URL.
import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import type { UserOption } from "./LeadForm";

type Props = {
  /** The list page, e.g. "/visits". */
  path: string;
  q?: string;
  placeholder: string;
  /** Kept when searching (e.g. the current status tab). */
  hidden?: Record<string, string | undefined>;
  /** Agent filter: the users to choose from (null = don't show it), its param name and value. */
  agents?: { users: UserOption[] | null; param: string; value?: string };
  isFiltered: boolean;
};

export function ListSearch({ path, q, placeholder, hidden = {}, agents, isFiltered }: Props) {
  return (
    <Form action={path} className="card filters filters--inline" role="search">
      {Object.entries(hidden).map(([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />)}
      <div className="filters__search field__control">
        <Search size={18} className="filters__search-icon" aria-hidden="true" />
        <input name="q" type="search" defaultValue={q} placeholder={placeholder} aria-label={placeholder} />
      </div>
      {agents?.users && (
        <label className="filters__item">
          <span className="visually-hidden">Agent</span>
          <select name={agents.param} defaultValue={agents.value ?? ""} aria-label="Agent">
            <option value="">Any agent</option>
            <option value="me">Me</option>
            <option value="unassigned">No agent yet</option>
            {agents.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" className="button button--primary button--sm">
        Search
      </button>
      {isFiltered && (
        <Link href={path} className="button button--secondary button--sm">
          Clear
        </Link>
      )}
    </Form>
  );
}
