// Contacts (admins only): customer records, searchable, with how many inquiries each has made.
// Contacts are created automatically when a lead is logged or an inquiry arrives.
import type { Metadata } from "next";
import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { ContactRound, Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { apiGet, requireAdmin } from "@/lib/auth";
import { formatDate, type Contact } from "@/lib/leads";

export const metadata: Metadata = { title: "Contacts" };

/** Laravel's plain paginator JSON (not a resource collection). */
type ContactPage = { data: Contact[]; current_page: number; last_page: number; total: number };

export default function ContactsPage({ searchParams }: PageProps<"/contacts">) {
  return (
    <>
      <PageHeader title="Contacts" description="Customers and prospects. Added automatically when an inquiry is logged." />
      <Suspense fallback={<div className="card skeleton-block skeleton-block--panel" />}>
        <Contacts searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Contacts({ searchParams }: Pick<PageProps<"/contacts">, "searchParams">) {
  await requireAdmin();
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const q = first(params.q)?.slice(0, 100);
  const page = first(params.page);
  const query = new URLSearchParams({ ...(q && { q }), ...(page && /^\d+$/.test(page) && { page }) }).toString();
  const contacts = await apiGet<ContactPage>(`/contacts${query ? `?${query}` : ""}`);

  return (
    <>
      <Form key={q ?? ""} action="/contacts" className="card filters filters--inline" role="search">
        <div className="filters__search field__control">
          <Search size={18} className="filters__search-icon" aria-hidden="true" />
          <input name="q" type="search" defaultValue={q} placeholder="Search by name, email or phone" aria-label="Search contacts" />
        </div>
        <button type="submit" className="button button--primary button--sm">
          Search
        </button>
        {q && (
          <Link href="/contacts" className="button button--secondary button--sm">
            Clear
          </Link>
        )}
      </Form>

      <section className="card">
        {contacts.data.length === 0 ? (
          q ? (
            <EmptyState icon={SearchX} title="No matching contacts" description="Try a different name, email or phone number." />
          ) : (
            <EmptyState icon={ContactRound} title="No contacts yet" description="Contacts are created when you log an inquiry or one arrives from the website." />
          )
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Leads</th>
                  <th scope="col">Added</th>
                </tr>
              </thead>
              <tbody>
                {contacts.data.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <Link href={`/contacts/${contact.id}`} className="table__primary-link">
                        {contact.name}
                      </Link>
                    </td>
                    <td>{contact.email ?? <span className="muted">—</span>}</td>
                    <td className="table__nowrap">{contact.phone ?? <span className="muted">—</span>}</td>
                    <td>{contact.leads_count}</td>
                    <td className="table__nowrap">{formatDate(contact.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Pagination basePath="/contacts" params={{ q }} page={contacts.current_page} lastPage={contacts.last_page} />
    </>
  );
}
