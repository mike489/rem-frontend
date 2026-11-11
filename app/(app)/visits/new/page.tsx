// Schedule (or record a request for) a visit. ?lead=ID fixes the lead (from the lead's page).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PropertyOption, UserOption } from "@/components/LeadForm";
import { PageHeader } from "@/components/PageHeader";
import { VisitForm } from "@/components/VisitForm";
import { apiGet, requireUser } from "@/lib/auth";
import { toLeadOption, type Lead, type LeadOption } from "@/lib/leads";
import { idParam } from "@/lib/params";

export const metadata: Metadata = { title: "Schedule visit" };

export default function NewVisitPage({ searchParams }: PageProps<"/visits/new">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Schedule visit" />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <NewVisit searchParams={searchParams} />
    </Suspense>
  );
}

async function NewVisit({ searchParams }: Pick<PageProps<"/visits/new">, "searchParams">) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const leadId = idParam(await searchParams, "lead");

  const [leads, properties, users, lead] = await Promise.all([
    leadId ? Promise.resolve([]) : apiGet<LeadOption[]>("/leads/options"),
    apiGet<PropertyOption[]>("/properties/options"),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
    // Also checks the user may work on this lead (403 -> dashboard).
    leadId ? apiGet<{ data: Lead }>(`/leads/${leadId}`).then((r) => r.data) : Promise.resolve(null),
  ]);
  const back = lead ? { href: `/leads/${lead.id}`, label: lead.contact.name } : { href: "/visits", label: "All visits" };

  return (
    <>
      <PageHeader
        title="Schedule visit"
        description="Book a viewing, or note that the customer wants one and agree the time later."
        back={
          <Link href={back.href}>
            <ArrowLeft size={16} aria-hidden="true" /> {back.label}
          </Link>
        }
      />
      <VisitForm
        leads={leads}
        fixedLead={lead && toLeadOption(lead)}
        properties={properties}
        users={users}
        defaultAgentId={lead?.assignee?.id}
        cancelHref={back.href}
      />
    </>
  );
}
