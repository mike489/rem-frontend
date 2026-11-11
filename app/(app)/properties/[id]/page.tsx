// Property details: photos, price, status, location, facts and description.
// Admins also get Edit and Delete.
/* eslint-disable @next/next/no-img-element -- photos are served by the Laravel API */
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, MapPin, MessageSquarePlus, Pencil } from "lucide-react";
import { AdminOnly } from "@/components/AdminOnly";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { PropertyFacts } from "@/components/PropertyFacts";
import { apiGet } from "@/lib/auth";
import { PURPOSE_LABELS, STATUS_LABELS, STATUS_TONES, formatPrice, type Property } from "@/lib/properties";
import { deleteProperty } from "../actions";

export const metadata: Metadata = { title: "Property" };

const backLink = (
  <Link href="/properties">
    <ArrowLeft size={16} aria-hidden="true" /> All properties
  </Link>
);

export default function PropertyPage({ params }: PageProps<"/properties/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Loading…" back={backLink} />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <PropertyDetail params={params} />
    </Suspense>
  );
}

async function PropertyDetail({ params }: Pick<PageProps<"/properties/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { data: property } = await apiGet<{ data: Property }>(`/properties/${id}`);
  const [cover, ...others] = property.images ?? [];

  return (
    <>
      <PageHeader
        title={property.title}
        back={backLink}
        description={
          <span className="inline-icon">
            <MapPin size={16} aria-hidden="true" /> {property.address}, {property.city}
          </span>
        }
        actions={
          <>
            <Link href={`/leads/new?property=${property.id}`} className="button button--secondary button--sm">
              <MessageSquarePlus size={16} aria-hidden="true" /> Log inquiry
            </Link>
            <Suspense fallback={null}>
              <AdminOnly>
                <Link href={`/properties/${property.id}/edit`} className="button button--secondary button--sm">
                  <Pencil size={16} aria-hidden="true" /> Edit
                </Link>
                <DeleteButton
                  action={deleteProperty.bind(null, property.id)}
                  confirmMessage={`Delete “${property.title}”? Its photos are deleted too. This can’t be undone.`}
                />
              </AdminOnly>
            </Suspense>
          </>
        }
      />

      <div className="property-detail">
        <section className="gallery" aria-label="Photos">
          {cover ? (
            <>
              <a href={cover.url} target="_blank" rel="noreferrer" className="gallery__cover">
                <img src={cover.url} alt={`${property.title}, photo 1`} />
              </a>
              {others.length > 0 && (
                <ul className="gallery__thumbs">
                  {others.map((image, i) => (
                    <li key={image.id}>
                      <a href={image.url} target="_blank" rel="noreferrer">
                        <img src={image.url} alt={`${property.title}, photo ${i + 2}`} loading="lazy" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="gallery__empty">
              <ImageOff size={28} aria-hidden="true" />
              <span>No photos yet</span>
            </div>
          )}
        </section>

        <aside className="card property-summary">
          <div className="property-summary__badges">
            <Badge tone="accent">{PURPOSE_LABELS[property.purpose]}</Badge>
            <Badge tone={STATUS_TONES[property.status]}>{STATUS_LABELS[property.status]}</Badge>
          </div>
          <p className="property-summary__price">{formatPrice(property)}</p>
          <PropertyFacts property={property} />
          <dl className="property-summary__meta">
            <div>
              <dt>Added</dt>
              <dd>
                {new Date(property.created_at).toLocaleDateString("en", { dateStyle: "medium" })}
                {property.created_by && ` by ${property.created_by.name}`}
              </dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{new Date(property.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}</dd>
            </div>
          </dl>
        </aside>

        <section className="card property-description">
          <div className="card__header">
            <h2>Description</h2>
          </div>
          {property.description ? (
            <p className="prose">{property.description}</p>
          ) : (
            <p className="muted">No description yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
