// Deals: sales and rentals from negotiation to booking to closed.
// Admins see every deal and can filter by agent; agents see deals they handle or on their leads.
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Handshake, SearchX } from "lucide-react";
import { DealTable } from "@/components/DealTable";
import { EmptyState } from "@/components/EmptyState";
import type { UserOption } from "@/components/LeadForm";
import { ListSearch } from "@/components/ListSearch";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusTabs } from "@/components/StatusTabs";
import { apiGet, requireUser } from "@/lib/auth";
import { DEAL_STATUSES, DEAL_STATUS_LABELS, dealQuery, parseDealFilters, type Deal, type DealStatus } from "@/lib/deals";
import type { Paginated } from "@/lib/properties";

export const metadata: Metadata = { title: "Deals" };

type DealPage = Paginated<Deal> & { status_counts: Record<DealStatus | "active", number> };

export default function DealsPage({ searchParams }: PageProps<"/deals">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Deals" description="Sales and rentals from offer to close." />
          <div className="card skeleton-block skeleton-block--panel" />
        </>
      }
    >
      <Deals searchParams={searchParams} />
    </Suspense>
  );
}

async function Deals({ searchParams }: Pick<PageProps<"/deals">, "searchParams">) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const filters = parseDealFilters(await searchParams);
  const [{ data: deals, meta, status_counts: counts }, users] = await Promise.all([
    apiGet<DealPage>(`/deals${dealQuery(filters)}`),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
  ]);

  const tab = (value: string | undefined, label: string, count: number) => ({
    label,
    count,
    href: `/deals${dealQuery({ ...filters, status: value, page: undefined })}`,
    active: filters.status === value,
  });
  const tabs = [
    tab(undefined, "All", DEAL_STATUSES.reduce((sum, s) => sum + counts[s], 0)),
    tab("active", "In progress", counts.active),
    ...DEAL_STATUSES.map((s) => tab(s, DEAL_STATUS_LABELS[s], counts[s])),
  ];
  const isFiltered = Boolean(filters.q || filters.status || filters.agent_id);

  return (
    <>
      <PageHeader
        title={isAdmin ? "Deals" : "My deals"}
        description="Track each sale or rental from negotiation to booking to closed."
        actions={
          <Link href="/deals/new" className="button button--primary">
            <Handshake size={18} aria-hidden="true" /> Create deal
          </Link>
        }
      />

      <StatusTabs tabs={tabs} label="Filter by status" />
      <ListSearch
        key={dealQuery(filters)}
        path="/deals"
        q={filters.q}
        placeholder="Search by customer or property"
        hidden={{ status: filters.status }}
        agents={{ users, param: "agent_id", value: filters.agent_id }}
        isFiltered={isFiltered}
      />

      <section className="card">
        {deals.length === 0 ? (
          isFiltered ? (
            <EmptyState icon={SearchX} title="No matching deals" description="Try another status, search or agent." />
          ) : (
            <EmptyState
              icon={Handshake}
              title="No deals yet"
              description="When a customer makes an offer, create a deal from their lead to track it to closing."
            />
          )
        ) : (
          <DealTable deals={deals} showAgent={isAdmin} />
        )}
      </section>
      <Pagination basePath="/deals" params={filters} page={meta.current_page} lastPage={meta.last_page} />
    </>
  );
}
