// Create a deal. ?lead=ID fixes the lead (from the lead's page).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DealForm } from "@/components/DealForm";
import type { PropertyOption, UserOption } from "@/components/LeadForm";
import { PageHeader } from "@/components/PageHeader";
import { apiGet, requireUser } from "@/lib/auth";
import { toLeadOption, type Lead, type LeadOption } from "@/lib/leads";
import { idParam } from "@/lib/params";

export const metadata: Metadata = { title: "Create deal" };

export default function NewDealPage({ searchParams }: PageProps<"/deals/new">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Create deal" />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <NewDeal searchParams={searchParams} />
    </Suspense>
  );
}

async function NewDeal({ searchParams }: Pick<PageProps<"/deals/new">, "searchParams">) {
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
  const back = lead ? { href: `/leads/${lead.id}`, label: lead.contact.name } : { href: "/deals", label: "All deals" };

  return (
    <>
      <PageHeader
        title="Create deal"
        description="Record an offer or a booking. You can move it to Booked and Closed later."
        back={
          <Link href={back.href}>
            <ArrowLeft size={16} aria-hidden="true" /> {back.label}
          </Link>
        }
      />
      <DealForm
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
