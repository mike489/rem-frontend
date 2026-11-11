// Where a deal is on the way from inquiry to closed: Inquiry -> Negotiating -> Booked -> Closed.
import { Check, X } from "lucide-react";
import { formatDate } from "@/lib/dates";
import type { Deal } from "@/lib/deals";

export function DealProgress({ deal, inquiryAt }: { deal: Deal; inquiryAt?: string }) {
  const steps = [
    { key: "inquiry", label: "Inquiry", date: inquiryAt },
    { key: "negotiating", label: "Negotiating", date: deal.created_at },
    { key: "booked", label: "Booked", date: deal.booked_at },
    { key: "closed", label: "Closed", date: deal.closed_at },
  ];
  // How far it got: index of the last step reached.
  const reached = { negotiating: 1, booked: 2, closed: 3, cancelled: deal.booked_at ? 2 : 1 }[deal.status];
  const cancelled = deal.status === "cancelled";

  return (
    <ol className="progress" aria-label="Deal progress">
      {steps.map((step, i) => {
        const done = i <= reached;
        const current = i === reached;
        return (
          <li
            key={step.key}
            className={`progress__step${done ? " progress__step--done" : ""}${current && cancelled ? " progress__step--stopped" : ""}`}
            aria-current={current ? "step" : undefined}
          >
            <span className="progress__dot" aria-hidden="true">
              {current && cancelled ? <X size={14} /> : done ? <Check size={14} /> : i + 1}
            </span>
            <span className="progress__label">{step.label}</span>
            {done && step.date && <span className="progress__date">{formatDate(step.date)}</span>}
          </li>
        );
      })}
      {cancelled && <li className="progress__note">Cancelled</li>}
    </ol>
  );
}
