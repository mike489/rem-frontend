// Shown when a contact id doesn't exist.
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function ContactNotFound() {
  return (
    <section className="card">
      <EmptyState
        icon={SearchX}
        title="Contact not found"
        description="The link may be wrong."
        action={
          <Link href="/contacts" className="button button--secondary button--sm">
            Back to contacts
          </Link>
        }
      />
    </section>
  );
}
