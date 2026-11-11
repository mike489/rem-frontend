"use client";
// Layout for signed-in pages: sidebar (logo, navigation, signed-in user) + main content.
// On small screens the sidebar becomes a slide-in drawer opened from a slim top bar.
// Navigation and the user block depend on the session, so they're passed in as server-rendered slots.
import { useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

type Props = {
  /** Role-filtered navigation links (components/SidebarNav). */
  nav: ReactNode;
  /** Signed-in user block (name, role, sign out). */
  userMenu: ReactNode;
  children: ReactNode;
};

export function AppShell({ nav, userMenu, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  // Close the mobile drawer when any link inside the sidebar is followed.
  const closeOnLinkClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) closeDrawer();
  };

  return (
    <div className={`shell${drawerOpen ? " shell--drawer-open" : ""}`}>
      <aside className="sidebar" id="sidebar" onClick={closeOnLinkClick}>
        <div className="sidebar__header">
          <Link href="/" aria-label="REM home">
            <Logo />
          </Link>
          <button type="button" className="icon-button sidebar__close" onClick={closeDrawer} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {nav}
        </nav>

        <div className="sidebar__footer">{userMenu}</div>
      </aside>

      {/* Dimmed backdrop behind the mobile drawer; clicking it closes the drawer. */}
      <div className="backdrop" onClick={closeDrawer} aria-hidden="true" />

      <div className="shell__main">
        {/* Only shown on small screens, where the sidebar is hidden. */}
        <header className="topbar">
          <button
            type="button"
            className="icon-button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-controls="sidebar"
            aria-expanded={drawerOpen}
          >
            <Menu size={22} />
          </button>
          <Link href="/" className="topbar__logo" aria-label="REM home">
            <Logo />
          </Link>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
