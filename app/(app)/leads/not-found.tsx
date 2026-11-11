// Shown when a lead id doesn't exist (e.g. it was deleted).
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function LeadNotFound() {
  return (
    <section className="card">
      <EmptyState
        icon={SearchX}
        title="Lead not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href="/leads" className="button button--secondary button--sm">
            Back to leads
          </Link>
        }
      />
    </section>
  );
}
