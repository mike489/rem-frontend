// Leads as a table: contact, property, stage, assignee, source, last activity.
import Link from "next/link";
import { Badge } from "./Badge";
import { SOURCE_LABELS, STAGE_LABELS, STAGE_TONES, formatDate, type Lead } from "@/lib/leads";

type Props = {
  leads: Lead[];
  /** Agents only see their own leads, so the column adds nothing for them. */
  showAssignee?: boolean;
  /** Hide the contact column (e.g. on a contact's own page). */
  showContact?: boolean;
};

export function LeadTable({ leads, showAssignee = true, showContact = true }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {showContact && <th scope="col">Contact</th>}
            <th scope="col">Property</th>
            <th scope="col">Stage</th>
            {showAssignee && <th scope="col">Assigned to</th>}
            <th scope="col">Source</th>
            <th scope="col">Last activity</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              {showContact && (
                <td>
                  <Link href={`/leads/${lead.id}`} className="table__primary-link">
                    {lead.contact.name}
                  </Link>
                  <span className="table__sub">{lead.contact.email ?? lead.contact.phone}</span>
                </td>
              )}
              <td>
                {showContact ? (
                  (lead.property?.title ?? <span className="muted">General inquiry</span>)
                ) : (
                  <Link href={`/leads/${lead.id}`} className="table__primary-link">
                    {lead.property?.title ?? "General inquiry"}
                  </Link>
                )}
              </td>
              <td>
                <Badge tone={STAGE_TONES[lead.stage]}>{STAGE_LABELS[lead.stage]}</Badge>
              </td>
              {showAssignee && <td>{lead.assignee?.name ?? <span className="muted">Unassigned</span>}</td>}
              <td>{SOURCE_LABELS[lead.source]}</td>
              <td className="table__nowrap">{formatDate(lead.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
