// One visit: when and where, the customer, its history, and controls to reschedule or mark how it went.
// Agents can open visits they handle or whose lead is theirs (Laravel returns 403 otherwise -> redirect).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, Handshake, Inbox, Mail, Phone, StickyNote, UserRound } from "lucide-react";
import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import type { PropertyOption, UserOption } from "@/components/LeadForm";
import { LeadNoteForm } from "@/components/LeadNoteForm";
import { LeadTimeline } from "@/components/LeadTimeline";
import { PageHeader } from "@/components/PageHeader";
import { VisitUpdateForm } from "@/components/VisitUpdateForm";
import { apiGet, requireUser } from "@/lib/auth";
import { formatVisitTime } from "@/lib/dates";
import { VISIT_STATUS_LABELS, VISIT_STATUS_TONES, isOverdue, type Visit } from "@/lib/visits";
import { addVisitNote, deleteVisit, updateVisit } from "../actions";

export const metadata: Metadata = { title: "Visit" };

const backLink = (
  <Link href="/visits">
    <ArrowLeft size={16} aria-hidden="true" /> All visits
  </Link>
);

export default function VisitPage({ params }: PageProps<"/visits/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Loading…" back={backLink} />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <VisitDetail params={params} />
    </Suspense>
  );
}

async function VisitDetail({ params }: Pick<PageProps<"/visits/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  const [{ data: visit }, properties, users] = await Promise.all([
    apiGet<{ data: Visit }>(`/visits/${id}`),
    apiGet<PropertyOption[]>("/properties/options"),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
  ]);
  const lead = visit.lead!;
  const contact = lead.contact!;
  const overdue = isOverdue(visit);

  return (
    <>
      <PageHeader
        title={`Visit: ${visit.property?.title ?? "property"}`}
        back={backLink}
        description={
          <>
            <Badge tone={VISIT_STATUS_TONES[visit.status]}>{VISIT_STATUS_LABELS[visit.status]}</Badge>{" "}
            {visit.scheduled_at ? formatVisitTime(visit.scheduled_at) : "Time not agreed yet"} · with {contact.name}
          </>
        }
        actions={
          <>
            {visit.status === "completed" && (
              <Link href={`/deals/new?lead=${lead.id}`} className="button button--secondary button--sm">
                <Handshake size={16} aria-hidden="true" /> Create deal
              </Link>
            )}
            {isAdmin && (
              <DeleteButton
                action={deleteVisit.bind(null, visit.id)}
                confirmMessage={`Delete this visit with ${contact.name}? The lead keeps a note that it was deleted.`}
              />
            )}
          </>
        }
      />

      {overdue && <Alert>The visit time has passed. Mark it Completed, No-show or Cancelled, or reschedule it.</Alert>}

      <div className="lead-detail">
        <div className="lead-detail__main">
          <section className="card">
            <div className="card__header">
              <h2>Details</h2>
            </div>
            <ul className="contact-list">
              <li>
                <CalendarClock size={16} aria-hidden="true" />
                {visit.scheduled_at ? formatVisitTime(visit.scheduled_at) : "Not scheduled yet"}
              </li>
              {visit.property && (
                <li>
                  <Building2 size={16} aria-hidden="true" />
                  <span>
                    <Link href={`/properties/${visit.property.id}`}>{visit.property.title}</Link>
                    <span className="muted">
                      {" "}
                      · {visit.property.address}, {visit.property.city}
                    </span>
                  </span>
                </li>
              )}
              <li>
                <UserRound size={16} aria-hidden="true" />
                Shown by {visit.agent?.name ?? "— not decided yet"}
              </li>
              {visit.notes && (
                <li className="contact-list__multiline">
                  <StickyNote size={16} aria-hidden="true" />
                  <span className="prose">{visit.notes}</span>
                </li>
              )}
            </ul>
          </section>

          <section className="card">
            <div className="card__header">
              <h2>History</h2>
              <p>Changes to this visit and notes about it. They also appear on the lead.</p>
            </div>
            <LeadNoteForm action={addVisitNote.bind(null, lead.id, visit.id)} />
            <LeadTimeline notes={visit.history ?? []} linkRecords={false} emptyText="Nothing recorded yet." />
          </section>
        </div>

        <aside className="lead-detail__side">
          <section className="card">
            <div className="card__header">
              <h2>Customer</h2>
            </div>
            <ul className="contact-list">
              <li>
                <Inbox size={16} aria-hidden="true" />
                <Link href={`/leads/${lead.id}`}>{contact.name}’s lead</Link>
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
              <h2>Update visit</h2>
              <p>Reschedule it, or record how it went.</p>
            </div>
            <VisitUpdateForm action={updateVisit.bind(null, visit.id)} visit={visit} properties={properties} users={users} />
          </section>
        </aside>
      </div>
    </>
  );
}
