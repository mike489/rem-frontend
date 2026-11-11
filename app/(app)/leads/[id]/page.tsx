// One lead: the inquiry, its visits and deals, notes & activity timeline, pipeline controls and contact details.
// Agents can open only leads assigned to them (Laravel returns 403 otherwise -> redirect).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarPlus, Handshake, Mail, Phone, UserRound } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DealTable } from "@/components/DealTable";
import { DeleteButton } from "@/components/DeleteButton";
import type { PropertyOption, UserOption } from "@/components/LeadForm";
import { LeadNoteForm } from "@/components/LeadNoteForm";
import { LeadTimeline } from "@/components/LeadTimeline";
import { LeadUpdateForm } from "@/components/LeadUpdateForm";
import { PageHeader } from "@/components/PageHeader";
import { VisitTable } from "@/components/VisitTable";
import { apiGet, requireUser } from "@/lib/auth";
import { SOURCE_LABELS, STAGE_LABELS, STAGE_TONES, formatDate, type Lead } from "@/lib/leads";
import { addLeadNote, deleteLead, updateLead } from "../actions";

export const metadata: Metadata = { title: "Lead" };

const backLink = (
  <Link href="/leads">
    <ArrowLeft size={16} aria-hidden="true" /> All leads
  </Link>
);

export default function LeadPage({ params }: PageProps<"/leads/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Loading…" back={backLink} />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <LeadDetail params={params} />
    </Suspense>
  );
}

async function LeadDetail({ params }: Pick<PageProps<"/leads/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  const [{ data: lead }, properties, users] = await Promise.all([
    apiGet<{ data: Lead }>(`/leads/${id}`),
    apiGet<PropertyOption[]>("/properties/options"),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
  ]);
  const { contact } = lead;

  return (
    <>
      <PageHeader
        title={contact.name}
        back={backLink}
        description={
          <>
            <Badge tone={STAGE_TONES[lead.stage]}>{STAGE_LABELS[lead.stage]}</Badge>{" "}
            {SOURCE_LABELS[lead.source]} inquiry · received {formatDate(lead.created_at)}
          </>
        }
        actions={
          <>
            <Link href={`/visits/new?lead=${lead.id}`} className="button button--secondary button--sm">
              <CalendarPlus size={16} aria-hidden="true" /> Schedule visit
            </Link>
            <Link href={`/deals/new?lead=${lead.id}`} className="button button--secondary button--sm">
              <Handshake size={16} aria-hidden="true" /> Create deal
            </Link>
            {isAdmin && (
              <DeleteButton
                action={deleteLead.bind(null, lead.id)}
                confirmMessage={`Delete this lead from ${contact.name}? Its notes, visits and deals are deleted too. The contact is kept.`}
              />
            )}
          </>
        }
      />

      <div className="lead-detail">
        <div className="lead-detail__main">
          <section className="card">
            <div className="card__header">
              <h2>Inquiry</h2>
              <p className="inline-icon">
                <Building2 size={15} aria-hidden="true" />
                {lead.property ? (
                  <Link href={`/properties/${lead.property.id}`}>
                    {lead.property.title}, {lead.property.city}
                  </Link>
                ) : (
                  "General inquiry"
                )}
              </p>
            </div>
            {lead.message ? <p className="prose">{lead.message}</p> : <p className="muted">No message.</p>}
          </section>

          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2>Visits</h2>
                <p>Viewings arranged for this customer.</p>
              </div>
              <Link href={`/visits/new?lead=${lead.id}`}>Schedule visit</Link>
            </div>
            {lead.visits?.length ? (
              <VisitTable visits={lead.visits} showCustomer={false} showAgent={isAdmin} />
            ) : (
              <p className="muted">No visits yet.</p>
            )}
          </section>

          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2>Deals</h2>
                <p>Offers and bookings, from negotiation to closed.</p>
              </div>
              <Link href={`/deals/new?lead=${lead.id}`}>Create deal</Link>
            </div>
            {lead.deals?.length ? (
              <DealTable deals={lead.deals} showCustomer={false} showAgent={isAdmin} />
            ) : (
              <p className="muted">No deals yet.</p>
            )}
          </section>

          <section className="card">
            <div className="card__header">
              <h2>Notes & activity</h2>
              <p>Keep a record of every follow-up.</p>
            </div>
            <LeadNoteForm action={addLeadNote.bind(null, lead.id)} />
            <LeadTimeline notes={lead.notes ?? []} />
          </section>
        </div>

        <aside className="lead-detail__side">
          <section className="card">
            <div className="card__header">
              <h2>Contact</h2>
            </div>
            <ul className="contact-list">
              <li>
                <UserRound size={16} aria-hidden="true" />
                {isAdmin ? <Link href={`/contacts/${contact.id}`}>{contact.name}</Link> : contact.name}
              </li>
              {contact.email && (
                <li>
                  <Mail size={16} aria-hidden="true" />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <Phone size={16} aria-hidden="true" />
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a>
                </li>
              )}
            </ul>
          </section>

          <section className="card">
            <div className="card__header">
              <h2>Pipeline</h2>
              <p>{lead.assignee ? `Assigned to ${lead.assignee.name}` : "Not assigned yet"}</p>
            </div>
            <LeadUpdateForm action={updateLead.bind(null, lead.id)} lead={lead} properties={properties} users={users} />
          </section>
        </aside>
      </div>
    </>
  );
}
