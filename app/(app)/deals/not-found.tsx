// Shown when a deal id doesn't exist (e.g. it was deleted).
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function DealNotFound() {
  return (
    <section className="card">
      <EmptyState
        icon={SearchX}
        title="Deal not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href="/deals" className="button button--secondary button--sm">
            Back to deals
          </Link>
        }
      />
    </section>
  );
}
