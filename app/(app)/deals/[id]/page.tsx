// One deal: progress from inquiry to closed, the terms, its history, and controls to move it along.
// Agents can open deals they handle or whose lead is theirs (Laravel returns 403 otherwise -> redirect).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Inbox, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DealProgress } from "@/components/DealProgress";
import { DealUpdateForm } from "@/components/DealUpdateForm";
import { DeleteButton } from "@/components/DeleteButton";
import type { PropertyOption, UserOption } from "@/components/LeadForm";
import { LeadNoteForm } from "@/components/LeadNoteForm";
import { LeadTimeline } from "@/components/LeadTimeline";
import { PageHeader } from "@/components/PageHeader";
import { apiGet, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { DEAL_STATUS_LABELS, DEAL_STATUS_TONES, formatDealAmount, type Deal } from "@/lib/deals";
import { STATUS_LABELS, formatMoney } from "@/lib/properties";
import { addDealNote, deleteDeal, updateDeal } from "../actions";

export const metadata: Metadata = { title: "Deal" };

const backLink = (
  <Link href="/deals">
    <ArrowLeft size={16} aria-hidden="true" /> All deals
  </Link>
);

export default function DealPage({ params }: PageProps<"/deals/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Loading…" back={backLink} />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <DealDetail params={params} />
    </Suspense>
  );
}

async function DealDetail({ params }: Pick<PageProps<"/deals/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  const [{ data: deal }, properties, users] = await Promise.all([
    apiGet<{ data: Deal }>(`/deals/${id}`),
    apiGet<PropertyOption[]>("/properties/options"),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
  ]);
  const lead = deal.lead!;
  const contact = lead.contact!;
  const terms: [string, string][] = [
    ["Type", deal.type === "rent" ? "Rental" : "Sale"],
    [deal.type === "rent" ? "Agreed rent" : "Agreed price", formatDealAmount(deal)],
    ["Deposit", deal.deposit !== null ? formatMoney(deal.deposit) : "—"],
    ["Agent", deal.agent?.name ?? "Not decided"],
    ["Booked", deal.booked_at ? formatDate(deal.booked_at) : "—"],
    ["Closed", deal.closed_at ? formatDate(deal.closed_at) : "—"],
  ];

  return (
    <>
      <PageHeader
        title={`${contact.name} · ${deal.property?.title ?? "Deleted property"}`}
        back={backLink}
        description={
          <>
            <Badge tone={DEAL_STATUS_TONES[deal.status]}>{DEAL_STATUS_LABELS[deal.status]}</Badge> {formatDealAmount(deal)} · opened{" "}
            {formatDate(deal.created_at)}
          </>
        }
        actions={
          isAdmin && (
            <DeleteButton
              action={deleteDeal.bind(null, deal.id)}
              confirmMessage={`Delete this deal with ${contact.name}? The lead keeps a note that it was deleted.`}
            />
          )
        }
      />

      <section className="card progress-card">
        <DealProgress deal={deal} inquiryAt={lead.created_at} />
      </section>

      <div className="lead-detail">
        <div className="lead-detail__main">
          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2>Terms</h2>
                {deal.property && (
                  <p>
                    <Link href={`/properties/${deal.property.id}`}>{deal.property.title}</Link>, {deal.property.city} · listed at{" "}
                    {formatMoney(deal.property.price)} · now {STATUS_LABELS[deal.property.status]}
                  </p>
                )}
              </div>
            </div>
            <dl className="terms">
              {terms.map(([label, value]) => (
                <div key={label} className="terms__item">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {deal.notes && <p className="prose deal-notes">{deal.notes}</p>}
          </section>

          <section className="card">
            <div className="card__header">
              <h2>History</h2>
              <p>Every change to this deal, and notes about it. They also appear on the lead.</p>
            </div>
            <LeadNoteForm action={addDealNote.bind(null, lead.id, deal.id)} />
            <LeadTimeline notes={deal.history ?? []} linkRecords={false} emptyText="Nothing recorded yet." />
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
              <h2>Update deal</h2>
              <p>Move it along as it progresses.</p>
            </div>
            <DealUpdateForm action={updateDeal.bind(null, deal.id)} deal={deal} properties={properties} users={users} />
          </section>
        </aside>
      </div>
    </>
  );
}
