// Notes and automatic activity (stage changes, assignments, visits, deals), newest first.
// Used on a lead (everything) and on a visit or deal (just its own entries).
import Link from "next/link";
import { Activity, MessageSquare } from "lucide-react";
import { formatDateTime, type LeadNote } from "@/lib/leads";

type Props = {
  notes: LeadNote[];
  /** Link entries to the visit or deal they are about (off on those pages themselves). */
  linkRecords?: boolean;
  emptyText?: string;
};

export function LeadTimeline({ notes, linkRecords = true, emptyText = "No notes yet." }: Props) {
  if (notes.length === 0) return <p className="muted">{emptyText}</p>;

  return (
    <ol className="timeline">
      {notes.map((note) => {
        const Icon = note.kind === "activity" ? Activity : MessageSquare;
        return (
          <li key={note.id} className={`timeline__item timeline__item--${note.kind}`}>
            <span className="timeline__icon" aria-hidden="true">
              <Icon size={14} />
            </span>
            <div className="timeline__body">
              <p className="timeline__text">{note.body}</p>
              <p className="timeline__meta">
                {note.user?.name ?? "System"} · {formatDateTime(note.created_at)}
                {linkRecords && note.visit_id && (
                  <>
                    {" · "}
                    <Link href={`/visits/${note.visit_id}`}>View visit</Link>
                  </>
                )}
                {linkRecords && note.deal_id && (
                  <>
                    {" · "}
                    <Link href={`/deals/${note.deal_id}`}>View deal</Link>
                  </>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
