// Previous / next links for a paginated list. Keeps the other search params.
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  lastPage: number;
};

export function Pagination({ basePath, params, page, lastPage }: Props) {
  if (lastPage <= 1) return null;

  const href = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value && key !== "page") query.set(key, value);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="button button--secondary button--sm">
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="pagination__status">
        Page {page} of {lastPage}
      </span>
      {page < lastPage ? (
        <Link href={href(page + 1)} className="button button--secondary button--sm">
          Next <ChevronRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
