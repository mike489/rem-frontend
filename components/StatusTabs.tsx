// Row of pill links that filter a list by status, each with a count (leads, visits, deals).
import Link from "next/link";

export type StatusTab = { label: string; count: number; href: string; active: boolean; tone?: "alert" };

export function StatusTabs({ tabs, label }: { tabs: StatusTab[]; label: string }) {
  return (
    <nav className="stage-tabs" aria-label={label}>
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`stage-tab${tab.active ? " stage-tab--active" : ""}${tab.tone === "alert" && tab.count > 0 ? " stage-tab--alert" : ""}`}
          aria-current={tab.active ? "page" : undefined}
        >
          {tab.label} <span className="stage-tab__count">{tab.count}</span>
        </Link>
      ))}
    </nav>
  );
}
