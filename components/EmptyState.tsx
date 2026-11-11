// Friendly "nothing here yet" panel used by list pages, with an optional call to action.
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = { icon: LucideIcon; title: string; description: string; action?: ReactNode };

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={24} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
