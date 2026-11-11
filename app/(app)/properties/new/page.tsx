// Add a property (admins only).
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PropertyForm } from "@/components/PropertyForm";
import { requireAdmin } from "@/lib/auth";
import { saveProperty } from "../actions";

export const metadata: Metadata = { title: "Add property" };

export default function NewPropertyPage() {
  return (
    <>
      <PageHeader
        title="Add property"
        description="Add a listing to the inventory."
        back={
          <Link href="/properties">
            <ArrowLeft size={16} aria-hidden="true" /> All properties
          </Link>
        }
      />
      <Suspense fallback={<div className="card skeleton-block skeleton-block--form" />}>
        <AdminForm />
      </Suspense>
    </>
  );
}

async function AdminForm() {
  await requireAdmin();
  return <PropertyForm action={saveProperty.bind(null, null)} />;
}
