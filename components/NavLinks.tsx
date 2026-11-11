"use client";
// The sidebar links for one role, with the current page highlighted.
// Receives only the role (a string): icon components can't be passed from server to client.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navForRole } from "@/lib/navigation";
import type { Role } from "@/lib/roles";

export function NavLinks({ role }: { role: Role }) {
  const pathname = usePathname();

  return navForRole(role).map((section, i) => (
    <div key={section.title ?? i} className="nav-section">
      {section.title && <p className="nav-section__title">{section.title}</p>}
      <ul>
        {section.items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link${active ? " nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}
