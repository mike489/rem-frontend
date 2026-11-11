// Units (placeholder until the units data model and API exist).
import type { Metadata } from "next";
import { DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Units" };

export default function UnitsPage() {
  return (
    <>
      <PageHeader title="Units" description="Apartments, offices and other rentable spaces." />
      <section className="card">
        <EmptyState icon={DoorOpen} title="No units yet" description="Units belong to a property. Once added, you'll see their status, size and rent here." />
      </section>
    </>
  );
}
