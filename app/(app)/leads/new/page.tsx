// Log an inquiry. ?property=ID preselects a property (from its page);
// ?contact=ID adds the inquiry to an existing contact (from the contact's page, admins).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LeadForm, type PropertyOption, type UserOption } from "@/components/LeadForm";
import { PageHeader } from "@/components/PageHeader";
import { apiGet, requireUser } from "@/lib/auth";
import type { Contact } from "@/lib/leads";

export const metadata: Metadata = { title: "Log inquiry" };

export default function NewLeadPage({ searchParams }: PageProps<"/leads/new">) {
  return (
    <>
      <PageHeader
        title="Log inquiry"
        description="Record a call, email or walk-in as a lead so it can be followed up."
        back={
          <Link href="/leads">
            <ArrowLeft size={16} aria-hidden="true" /> All leads
          </Link>
        }
      />
      <Suspense fallback={<div className="card skeleton-block skeleton-block--form" />}>
        <NewLead searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewLead({ searchParams }: Pick<PageProps<"/leads/new">, "searchParams">) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const params = await searchParams;
  const numberParam = (key: string) => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value && /^\d+$/.test(value) ? Number(value) : undefined;
  };
  const contactId = isAdmin ? numberParam("contact") : undefined;

  const [properties, users, contact] = await Promise.all([
    apiGet<PropertyOption[]>("/properties/options"),
    isAdmin ? apiGet<UserOption[]>("/users") : Promise.resolve(null),
    contactId ? apiGet<{ data: Contact }>(`/contacts/${contactId}`).then((r) => r.data) : Promise.resolve(null),
  ]);

  return <LeadForm properties={properties} users={users} contact={contact} defaultPropertyId={numberParam("property")} />;
}
