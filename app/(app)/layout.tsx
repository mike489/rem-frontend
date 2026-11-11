// Layout for all signed-in pages. proxy.ts already redirects visitors without a session cookie;
// pages check the user's role with requireUser()/requireAdmin() from lib/auth.ts.
import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { SidebarNav, SidebarNavSkeleton } from "@/components/SidebarNav";
import { UserMenu, UserMenuSkeleton } from "@/components/UserMenu";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      // Both read the auth cookie, so they stream in inside Suspense boundaries
      // while the rest of the shell renders immediately.
      nav={
        <Suspense fallback={<SidebarNavSkeleton />}>
          <SidebarNav />
        </Suspense>
      }
      userMenu={
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
