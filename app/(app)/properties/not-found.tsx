// Shown when a property id doesn't exist (e.g. it was deleted).
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function PropertyNotFound() {
  return (
    <section className="card">
      <EmptyState
        icon={SearchX}
        title="Property not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href="/properties" className="button button--secondary button--sm">
            Back to properties
          </Link>
        }
      />
    </section>
  );
}
