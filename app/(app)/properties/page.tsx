// Property list with search, filters and pagination. Admins and agents can browse;
// only admins see "Add property".
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Building2, Plus, SearchX } from "lucide-react";
import { AdminOnly } from "@/components/AdminOnly";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { apiGet } from "@/lib/auth";
import { parseFilters, toQueryString, type Paginated, type Property } from "@/lib/properties";

export const metadata: Metadata = { title: "Properties" };

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <>
      <PageHeader
        title="Properties"
        description="Your property inventory: listings for sale and for rent."
        actions={
          <Suspense fallback={null}>
            <AdminOnly>
              <Link href="/properties/new" className="button button--primary">
                <Plus size={18} aria-hidden="true" /> Add property
              </Link>
            </AdminOnly>
          </Suspense>
        }
      />
      <Suspense fallback={<ResultsSkeleton />}>
        <PropertyResults searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function PropertyResults({ searchParams }: Pick<PageProps<"/properties">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const { data: properties, meta } = await apiGet<Paginated<Property>>(`/properties${toQueryString(filters)}`);
  const isFiltered = Object.keys(filters).some((key) => key !== "page" && key !== "sort");

  return (
    <>
      {/* key: remount when the URL changes so the inputs show the current filters (e.g. after "Clear"). */}
      <PropertyFilters key={toQueryString(filters)} filters={filters} />

      {properties.length === 0 ? (
        <section className="card">
          {isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No matching properties"
              description="Try a different search or remove some filters."
              action={
                <Link href="/properties" className="button button--secondary button--sm">
                  Clear filters
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="Properties added to the inventory will be listed here."
            />
          )}
        </section>
      ) : (
        <>
          <p className="results-summary">
            Showing {meta.from}–{meta.to} of {meta.total} {meta.total === 1 ? "property" : "properties"}
          </p>
          <ul className="property-grid">
            {properties.map((property) => (
              <li key={property.id}>
                <PropertyCard property={property} />
              </li>
            ))}
          </ul>
          <Pagination basePath="/properties" params={filters} page={meta.current_page} lastPage={meta.last_page} />
        </>
      )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading properties">
      <div className="card skeleton-block skeleton-block--filters" />
      <ul className="property-grid">
        {[0, 1, 2].map((i) => (
          <li key={i} className="card skeleton-block skeleton-block--card" />
        ))}
      </ul>
    </div>
  );
}
