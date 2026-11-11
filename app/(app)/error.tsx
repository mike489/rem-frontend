"use client";
// Shown inside the app shell when a page fails to render, most often because the
// Laravel API is not running or returned an unexpected error.
import { RefreshCw, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <section className="card">
      <EmptyState
        icon={ServerCrash}
        title="Something went wrong"
        description="We couldn't load this page. Check that the API server is running, then try again."
        action={
          <button type="button" className="button button--secondary button--sm" onClick={() => retry()}>
            <RefreshCw size={16} aria-hidden="true" /> Try again
          </button>
        }
      />
    </section>
  );
}
