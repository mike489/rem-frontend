// Visits as a table: when, customer, property, status, agent.
import Link from "next/link";
import { Badge } from "./Badge";
import { formatVisitTime } from "@/lib/dates";
import { VISIT_STATUS_LABELS, VISIT_STATUS_TONES, isOverdue, type Visit } from "@/lib/visits";

type Props = {
  visits: Visit[];
  showAgent?: boolean;
  /** Hide the customer column (e.g. on a lead's own page). */
  showCustomer?: boolean;
};

export function VisitTable({ visits, showAgent = true, showCustomer = true }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">When</th>
            {showCustomer && <th scope="col">Customer</th>}
            <th scope="col">Property</th>
            <th scope="col">Status</th>
            {showAgent && <th scope="col">Agent</th>}
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td className="table__nowrap">
                <Link href={`/visits/${visit.id}`} className="table__primary-link">
                  {visit.scheduled_at ? formatVisitTime(visit.scheduled_at) : "Not scheduled yet"}
                </Link>
              </td>
              {showCustomer && (
                <td>
                  {visit.lead?.contact?.name}
                  {visit.lead?.contact?.phone && <span className="table__sub">{visit.lead.contact.phone}</span>}
                </td>
              )}
              <td>
                {visit.property?.title}
                {visit.property && <span className="table__sub">{visit.property.city}</span>}
              </td>
              <td className="table__nowrap">
                <Badge tone={VISIT_STATUS_TONES[visit.status]}>{VISIT_STATUS_LABELS[visit.status]}</Badge>
                {isOverdue(visit) && <span className="table__sub table__sub--alert">Time passed — update it</span>}
              </td>
              {showAgent && <td>{visit.agent?.name ?? <span className="muted">Not decided</span>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
