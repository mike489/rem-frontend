// Sidebar footer: signed-in user's name, role and a sign-out button.
import Link from "next/link";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";

export async function UserMenu() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    // API unreachable. Lives in the layout (outside error.tsx), so don't throw; the page shows the error.
    return <span className="user-menu__email">Offline</span>;
  }

  // Cookie present but token invalid/expired.
  if (!user) {
    return (
      <Link href="/api/session/expired" className="button button--secondary button--sm">
        Sign in again
      </Link>
    );
  }

  return (
    <div className="user-menu">
      <span className="user-menu__text">
        <span className="user-menu__name">{user.name}</span>
        <span className="user-menu__meta">
          <span className="user-menu__role">{ROLE_LABELS[user.role]}</span>
          <span className="user-menu__email">{user.email}</span>
        </span>
      </span>
      <form action="/api/logout" method="post">
        <button type="submit" className="icon-button" aria-label="Sign out" title="Sign out">
          <LogOut size={20} />
        </button>
      </form>
    </div>
  );
}

/** Placeholder shown while the user is loading. */
export function UserMenuSkeleton() {
  return (
    <div className="user-menu" aria-hidden="true">
      <span className="skeleton skeleton--text" />
    </div>
  );
}
