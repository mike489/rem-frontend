// Shown when a visit id doesn't exist (e.g. it was deleted).
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function VisitNotFound() {
  return (
    <section className="card">
      <EmptyState
        icon={SearchX}
        title="Visit not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href="/visits" className="button button--secondary button--sm">
            Back to visits
          </Link>
        }
      />
    </section>
  );
}
