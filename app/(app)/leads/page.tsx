// Leads: the pipeline. Admins see every lead and can filter by agent;
// agents see only the leads assigned to them ("My leads").
import type { Metadata } from "next";
import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { Inbox, MessageSquarePlus, Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { UserOption } from "@/components/LeadForm";
import { LeadTable } from "@/components/LeadTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { apiGet, requireUser } from "@/lib/auth";
import { STAGES, STAGE_LABELS, leadQuery, parseLeadFilters, type Lead, type LeadStage } from "@/lib/leads";
import type { Paginated } from "@/lib/properties";

export const metadata: Metadata = { title: "Leads" };

type LeadPage = Paginated<Lead> & { stage_counts: Record<LeadStage, number> };

export default function LeadsPage({ searchParams }: PageProps<"/leads">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Leads" description="Inquiries and their follow-up." />
          <div className="card skeleton-block skeleton-block--panel" />
        </>
      }
    >
      <Leads searchParams={searchParams} />
    </Suspense>
  );
}

async function Leads({ searchParams }: Pick<PageProps<"/leads">, "searchParams">) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const filters = parseLeadFilters(await searchParams);
  const [{ data: leads, meta, stage_counts }, users] = await Promise.all([
    apiGet<LeadPage>(`/leads${leadQuery(filters)}`),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
  ]);

  const total = STAGES.reduce((sum, s) => sum + stage_counts[s], 0);
  const open = total - stage_counts.won - stage_counts.lost;
  const tabs: { value?: string; label: string; count: number }[] = [
    { value: undefined, label: "All", count: total },
    { value: "open", label: "Open", count: open },
    ...STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s], count: stage_counts[s] })),
  ];
  const stageHref = (stage?: string) => `/leads${leadQuery({ ...filters, stage, page: undefined })}`;
  const isFiltered = Boolean(filters.q || filters.stage || filters.assigned_to);

  return (
    <>
      <PageHeader
        title={isAdmin ? "Leads" : "My leads"}
        description={isAdmin ? "Every inquiry, its stage and who is following it up." : "Inquiries assigned to you. Move them along and keep notes as you follow up."}
        actions={
          <Link href="/leads/new" className="button button--primary">
            <MessageSquarePlus size={18} aria-hidden="true" /> Log inquiry
          </Link>
        }
      />

      <nav className="stage-tabs" aria-label="Filter by stage">
        {tabs.map((tab) => {
          const active = (filters.stage ?? undefined) === tab.value;
          return (
            <Link
              key={tab.label}
              href={stageHref(tab.value)}
              className={`stage-tab${active ? " stage-tab--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label} <span className="stage-tab__count">{tab.count}</span>
            </Link>
          );
        })}
      </nav>

      <Form key={leadQuery(filters)} action="/leads" className="card filters filters--inline" role="search">
        {filters.stage && <input type="hidden" name="stage" value={filters.stage} />}
        <div className="filters__search field__control">
          <Search size={18} className="filters__search-icon" aria-hidden="true" />
          <input name="q" type="search" defaultValue={filters.q} placeholder="Search by name, email or phone" aria-label="Search leads" />
        </div>
        {users && (
          <label className="filters__item">
            <span className="visually-hidden">Assigned to</span>
            <select name="assigned_to" defaultValue={filters.assigned_to ?? ""} aria-label="Assigned to">
              <option value="">Any agent</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
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
          <Link href="/leads" className="button button--secondary button--sm">
            Clear
          </Link>
        )}
      </Form>

      <section className="card">
        {leads.length === 0 ? (
          isFiltered ? (
            <EmptyState icon={SearchX} title="No matching leads" description="Try another stage, search or agent." />
          ) : (
            <EmptyState
              icon={Inbox}
              title={isAdmin ? "No leads yet" : "No leads assigned to you"}
              description={
                isAdmin
                  ? "Inquiries from the website and the ones you log will appear here."
                  : "When an admin assigns you a lead, or you log an inquiry, it appears here."
              }
            />
          )
        ) : (
          <LeadTable leads={leads} showAssignee={isAdmin} />
        )}
      </section>
      <Pagination basePath="/leads" params={filters} page={meta.current_page} lastPage={meta.last_page} />
    </>
  );
}
