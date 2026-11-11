// Sidebar navigation for the signed-in app. Keep in sync with docs/screens.md.
// `roles` hides an item from other roles. Pages also check the role on the server,
// and Laravel enforces it on every API call, so hiding a link is not the only protection.
import {
  Building2,
  CalendarClock,
  ContactRound,
  Handshake,
  DoorOpen,
  Inbox,
  LayoutGrid,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "./roles";

export type NavItem = { href: string; label: string; icon: LucideIcon; roles?: Role[] };
export type NavSection = { title?: string; items: NavItem[] };

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Property workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutGrid },
      { href: "/properties", label: "Properties", icon: Building2 },
      { href: "/units", label: "Units", icon: DoorOpen },
    ],
  },
  {
    title: "Customers",
    items: [
      // Agents see only the leads assigned to them.
      { href: "/leads", label: "Leads", icon: Inbox },
      // Agents see visits and deals they handle or that belong to their leads.
      { href: "/visits", label: "Visits", icon: CalendarClock },
      { href: "/deals", label: "Deals", icon: Handshake },
      { href: "/contacts", label: "Contacts", icon: ContactRound, roles: ["admin"] },
    ],
  },
  {
    title: "Administration",
    items: [{ href: "/team", label: "Team", icon: Users, roles: ["admin"] }],
  },
  {
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

/** The sections and items a user with `role` may see (empty sections are dropped). */
export function navForRole(role: Role): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
}

/** True when `pathname` is the nav item's page or one of its sub-pages. */
export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
