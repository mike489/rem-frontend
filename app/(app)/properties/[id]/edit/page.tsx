// Edit a property (admins only).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PropertyForm } from "@/components/PropertyForm";
import { apiGet, requireAdmin } from "@/lib/auth";
import type { Property } from "@/lib/properties";
import { saveProperty } from "../../actions";

export const metadata: Metadata = { title: "Edit property" };

export default function EditPropertyPage({ params }: PageProps<"/properties/[id]/edit">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Edit property" />
          <div className="card skeleton-block skeleton-block--form" />
        </>
      }
    >
      <EditProperty params={params} />
    </Suspense>
  );
}

async function EditProperty({ params }: Pick<PageProps<"/properties/[id]/edit">, "params">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { data: property } = await apiGet<{ data: Property }>(`/properties/${id}`);

  return (
    <>
      <PageHeader
        title="Edit property"
        description={property.title}
        back={
          <Link href={`/properties/${property.id}`}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to property
          </Link>
        }
      />
      <PropertyForm action={saveProperty.bind(null, property.id)} property={property} />
    </>
  );
}
