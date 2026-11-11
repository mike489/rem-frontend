// One contact (admins only): editable details and every lead they've made.
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Inbox, MessageSquarePlus } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { EmptyState } from "@/components/EmptyState";
import { LeadTable } from "@/components/LeadTable";
import { PageHeader } from "@/components/PageHeader";
import { apiGet, requireAdmin } from "@/lib/auth";
import { formatDate, type Contact } from "@/lib/leads";
import { updateContact } from "../actions";

export const metadata: Metadata = { title: "Contact" };

const backLink = (
  <Link href="/contacts">
    <ArrowLeft size={16} aria-hidden="true" /> All contacts
  </Link>
);

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Loading…" back={backLink} />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <ContactDetail params={params} />
    </Suspense>
  );
}

async function ContactDetail({ params }: Pick<PageProps<"/contacts/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { data: contact } = await apiGet<{ data: Contact }>(`/contacts/${id}`);
  const leads = contact.leads ?? [];

  return (
    <>
      <PageHeader
        title={contact.name}
        back={backLink}
        description={`Contact since ${formatDate(contact.created_at)}`}
        actions={
          <Link href={`/leads/new?contact=${contact.id}`} className="button button--primary button--sm">
            <MessageSquarePlus size={16} aria-hidden="true" /> New inquiry
          </Link>
        }
      />
      <div className="team-grid">
        <section className="card">
          <div className="card__header">
            <h2>Leads</h2>
            <p>
              {leads.length} {leads.length === 1 ? "inquiry" : "inquiries"} from this contact.
            </p>
          </div>
          {leads.length === 0 ? (
            <EmptyState icon={Inbox} title="No leads" description="Log an inquiry for this contact to start following up." />
          ) : (
            <LeadTable leads={leads} showContact={false} />
          )}
        </section>
        <section className="card">
          <div className="card__header">
            <h2>Details</h2>
          </div>
          <ContactForm action={updateContact.bind(null, contact.id)} contact={contact} />
        </section>
      </div>
    </>
  );
}
