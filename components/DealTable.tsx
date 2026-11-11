// Deals as a table: customer, property, amount, status, agent, last update.
import Link from "next/link";
import { Badge } from "./Badge";
import { formatDate } from "@/lib/dates";
import { DEAL_STATUS_LABELS, DEAL_STATUS_TONES, formatDealAmount, type Deal } from "@/lib/deals";

type Props = {
  deals: Deal[];
  showAgent?: boolean;
  /** Hide the customer column (e.g. on a lead's own page). */
  showCustomer?: boolean;
};

export function DealTable({ deals, showAgent = true, showCustomer = true }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {showCustomer && <th scope="col">Customer</th>}
            <th scope="col">Property</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            {showAgent && <th scope="col">Agent</th>}
            <th scope="col">Updated</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => {
            const property = deal.property?.title ?? "Deleted property";
            return (
              <tr key={deal.id}>
                {showCustomer && (
                  <td>
                    <Link href={`/deals/${deal.id}`} className="table__primary-link">
                      {deal.lead?.contact?.name}
                    </Link>
                  </td>
                )}
                <td>
                  {showCustomer ? (
                    property
                  ) : (
                    <Link href={`/deals/${deal.id}`} className="table__primary-link">
                      {property}
                    </Link>
                  )}
                  <span className="table__sub">{deal.type === "rent" ? "Rental" : "Sale"}</span>
                </td>
                <td className="table__nowrap">{formatDealAmount(deal)}</td>
                <td>
                  <Badge tone={DEAL_STATUS_TONES[deal.status]}>{DEAL_STATUS_LABELS[deal.status]}</Badge>
                </td>
                {showAgent && <td>{deal.agent?.name ?? <span className="muted">Not decided</span>}</td>}
                <td className="table__nowrap">{formatDate(deal.updated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
