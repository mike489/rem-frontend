// Title + description at the top of each signed-in page, with optional actions on the right.
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  /** Buttons or links shown beside the title (e.g. "Add property"). */
  actions?: ReactNode;
  /** Small link above the title, e.g. "← All properties". */
  back?: ReactNode;
};

export function PageHeader({ title, description, actions, back }: Props) {
  return (
    <div className="page-header">
      {back && <div className="page-header__back">{back}</div>}
      <div className="page-header__row">
        <div>
          <h1>{title}</h1>
          {description && <p className="page-header__description">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}
