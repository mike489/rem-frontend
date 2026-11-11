// Visits: property viewings. Default view is "Upcoming" (requested + scheduled, soonest first).
// Admins see every visit and can filter by agent; agents see visits they handle or on their leads.
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarClock, CalendarPlus, SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { UserOption } from "@/components/LeadForm";
import { ListSearch } from "@/components/ListSearch";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusTabs } from "@/components/StatusTabs";
import { VisitTable } from "@/components/VisitTable";
import { apiGet, requireUser } from "@/lib/auth";
import type { Paginated } from "@/lib/properties";
import {
  VISIT_STATUSES,
  VISIT_STATUS_LABELS,
  parseVisitFilters,
  visitApiQuery,
  visitQuery,
  type Visit,
  type VisitStatus,
} from "@/lib/visits";

export const metadata: Metadata = { title: "Visits" };

type VisitPage = Paginated<Visit> & { status_counts: Record<VisitStatus | "active" | "overdue", number> };

export default function VisitsPage({ searchParams }: PageProps<"/visits">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Visits" description="Property viewings and their status." />
          <div className="card skeleton-block skeleton-block--panel" />
        </>
      }
    >
      <Visits searchParams={searchParams} />
    </Suspense>
  );
}

async function Visits({ searchParams }: Pick<PageProps<"/visits">, "searchParams">) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const filters = parseVisitFilters(await searchParams);
  const [{ data: visits, meta, status_counts: counts }, users] = await Promise.all([
    apiGet<VisitPage>(`/visits${visitApiQuery(filters)}`),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
  ]);

  const total = VISIT_STATUSES.reduce((sum, s) => sum + counts[s], 0);
  const tab = (value: string | undefined, label: string, count: number, tone?: "alert") => ({
    label,
    count,
    tone,
    href: `/visits${visitQuery({ ...filters, status: value, page: undefined })}`,
    active: filters.status === value,
  });
  const tabs = [
    tab(undefined, "Upcoming", counts.active),
    tab("overdue", "Needs update", counts.overdue, "alert" as const),
    ...VISIT_STATUSES.map((s) => tab(s, VISIT_STATUS_LABELS[s], counts[s])),
    tab("all", "All", total),
  ];
  const isFiltered = Boolean(filters.q || filters.status || filters.agent_id);

  return (
    <>
      <PageHeader
        title={isAdmin ? "Visits" : "My visits"}
        description={
          isAdmin
            ? "Every viewing: requests to arrange, what’s coming up, and how past visits went."
            : "Viewings you’re showing or that belong to your leads."
        }
        actions={
          <Link href="/visits/new" className="button button--primary">
            <CalendarPlus size={18} aria-hidden="true" /> Schedule visit
          </Link>
        }
      />

      <StatusTabs tabs={tabs} label="Filter by status" />
      <ListSearch
        key={visitQuery(filters)}
        path="/visits"
        q={filters.q}
        placeholder="Search by customer or property"
        hidden={{ status: filters.status }}
        agents={{ users, param: "agent_id", value: filters.agent_id }}
        isFiltered={isFiltered}
      />

      <section className="card">
        {visits.length === 0 ? (
          isFiltered ? (
            <EmptyState icon={SearchX} title="No matching visits" description="Try another status, search or agent." />
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming visits"
              description="Schedule a viewing from a lead, or use “Schedule visit”. Website viewing requests also appear here."
            />
          )
        ) : (
          <VisitTable visits={visits} showAgent={isAdmin} />
        )}
      </section>
      <Pagination basePath="/visits" params={filters} page={meta.current_page} lastPage={meta.last_page} />
    </>
  );
}
