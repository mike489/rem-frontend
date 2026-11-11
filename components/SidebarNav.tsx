// Sidebar navigation filtered by the signed-in user's role. Reads the session, so it
// streams in inside a <Suspense> boundary (see app/(app)/layout.tsx).
import { getCurrentUser } from "@/lib/auth";
import { NavLinks } from "./NavLinks";

export async function SidebarNav() {
  // This is in the layout, outside app/(app)/error.tsx, so an API outage must not throw here;
  // the page shows the error instead.
  const user = await getCurrentUser().catch(() => null);
  // No valid session: show only the links every role has; the page itself redirects to login.
  return <NavLinks role={user?.role ?? "agent"} />;
}

/** Placeholder rows while the user loads. */
export function SidebarNavSkeleton() {
  return (
    <div className="nav-section" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className="skeleton skeleton--nav" />
      ))}
    </div>
  );
}
