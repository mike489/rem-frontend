// Dashboard: leads, visits and deals at a glance, what needs attention, and recent activity.
// Admins see everything; agents see their own leads, visits and deals.
import { Suspense } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  Handshake,
  Inbox,
  MessageSquare,
  MessageSquarePlus,
  Sparkles,
  Trophy,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { apiGet, getCurrentUser, requireUser } from "@/lib/auth";
import { formatDateTime, formatVisitTime } from "@/lib/dates";
import { STAGE_LABELS, STAGE_TONES, formatDate, type Lead, type LeadNote } from "@/lib/leads";
import { STATUS_LABELS, STATUS_TONES, formatMoney, formatPrice, type Property } from "@/lib/properties";
import type { Visit } from "@/lib/visits";

type Dashboard = {
  stats: { total: number; available: number; for_sale: number; for_rent: number };
  recent: Property[];
  leads: { open: number; new: number; unassigned: number | null; recent: Lead[] };
  visits: { requested: number; upcoming: number; overdue: number; next: Visit[] };
  deals: { negotiating: number; booked: number; closed_this_month: number; closed_value_this_month: number };
  activity: (LeadNote & { lead: { id: number; name: string } })[];
};

type Stat = { label: string; value: number; hint?: string; icon: LucideIcon; href: string };
type Todo = { label: string; count: number; icon: LucideIcon; href: string };

/** "Welcome back, Jane" — streams in once the user is loaded. */
async function Greeting() {
  const user = await getCurrentUser().catch(() => null);
  const firstName = user?.name.split(" ")[0];
  return <>Welcome back{firstName ? `, ${firstName}` : ""}. Here’s what needs your attention.</>;
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <Suspense fallback="Here’s what needs your attention.">
            <Greeting />
          </Suspense>
        }
        actions={
          <>
            <Link href="/leads/new" className="button button--secondary button--sm">
              <MessageSquarePlus size={16} aria-hidden="true" /> Log inquiry
            </Link>
            <Link href="/visits/new" className="button button--primary button--sm">
              <CalendarPlus size={16} aria-hidden="true" /> Schedule visit
            </Link>
          </>
        }
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  const [user, data] = await Promise.all([requireUser(), apiGet<Dashboard>("/dashboard")]);
  const { recent, leads, visits, deals, activity } = data;
  const isAdmin = user.role === "admin";
  const my = (label: string) => (isAdmin ? label : `My ${label.toLowerCase()}`);

  const statCards: Stat[] = [
    { label: my("Open leads"), value: leads.open, icon: Inbox, href: "/leads?stage=open" },
    { label: "Visits this week", value: visits.upcoming, hint: "Scheduled in the next 7 days", icon: CalendarClock, href: "/visits?status=scheduled" },
    { label: my("Deals in progress"), value: deals.negotiating + deals.booked, hint: `${deals.booked} booked`, icon: Handshake, href: "/deals?status=active" },
    {
      label: "Closed this month",
      value: deals.closed_this_month,
      hint: deals.closed_this_month ? formatMoney(deals.closed_value_this_month) : undefined,
      icon: Trophy,
      href: "/deals?status=closed",
    },
  ];

  const todos: Todo[] = [
    ...(isAdmin ? [{ label: "Unassigned leads", count: leads.unassigned ?? 0, icon: UserX, href: "/leads?assigned_to=unassigned" }] : []),
    { label: "New leads to contact", count: leads.new, icon: Sparkles, href: "/leads?stage=new" },
    { label: "Visit requests to schedule", count: visits.requested, icon: CalendarPlus, href: "/visits?status=requested" },
    { label: "Past visits to update", count: visits.overdue, icon: CalendarX, href: "/visits?status=overdue" },
    { label: "Booked deals to close", count: deals.booked, icon: Handshake, href: "/deals?status=booked" },
  ];

  return (
    <>
      <section className="stats" aria-label="Summary">
        {statCards.map(({ label, value, hint, icon: Icon, href }) => (
          <Link key={label} href={href} className="card stat">
            <div className="stat__top">
              <span className="stat__label">{label}</span>
              <span className="stat__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
            </div>
            <span className="stat__value">{value.toLocaleString("en")}</span>
            {hint && <span className="stat__hint">{hint}</span>}
          </Link>
        ))}
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-grid__col">
          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2>Upcoming visits</h2>
                <p>{isAdmin ? "The next scheduled viewings." : "Your next scheduled viewings."}</p>
              </div>
              <Link href="/visits">View all</Link>
            </div>
            {visits.next.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No visits scheduled" description="Schedule a viewing from a lead to see it here." />
            ) : (
              <ul className="recent-list">
                {visits.next.map((visit) => (
                  <li key={visit.id}>
                    <Link href={`/visits/${visit.id}`} className="recent-item">
                      <span className="recent-item__body">
                        <strong>{visit.lead?.contact?.name}</strong>
                        <span>
                          {visit.property?.title}
                          {isAdmin && ` · ${visit.agent?.name ?? "No agent yet"}`}
                        </span>
                      </span>
                      <span className="recent-item__when">{visit.scheduled_at && formatVisitTime(visit.scheduled_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2>{isAdmin ? "Open leads" : "My leads"}</h2>
                <p>{isAdmin ? "The most recently active inquiries." : "Inquiries assigned to you that are still open."}</p>
              </div>
              {leads.recent.length > 0 && <Link href="/leads?stage=open">View all</Link>}
            </div>
            {leads.recent.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={isAdmin ? "No open leads" : "No open leads assigned to you"}
                description={isAdmin ? "New inquiries will show up here." : "When an admin assigns you a lead, it shows up here."}
              />
            ) : (
              <ul className="recent-list">
                {leads.recent.map((lead) => (
                  <li key={lead.id}>
                    <Link href={`/leads/${lead.id}`} className="recent-item">
                      <span className="recent-item__body">
                        <strong>{lead.contact.name}</strong>
                        <span>
                          {lead.property?.title ?? "General inquiry"} · {formatDate(lead.updated_at)}
                          {isAdmin && ` · ${lead.assignee?.name ?? "Unassigned"}`}
                        </span>
                      </span>
                      <Badge tone={STAGE_TONES[lead.stage]}>{STAGE_LABELS[lead.stage]}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="card__header card__header--row">
              <div>
                <h2>Recently added properties</h2>
                <p>The latest listings in the inventory.</p>
              </div>
              {recent.length > 0 && <Link href="/properties">View all</Link>}
            </div>
            {recent.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No properties yet"
                description={isAdmin ? "Add your first property to get started." : "Listings will appear here once an admin adds them."}
              />
            ) : (
              <ul className="recent-list">
                {recent.map((property) => (
                  <li key={property.id}>
                    <Link href={`/properties/${property.id}`} className="recent-item">
                      <span className="recent-item__body">
                        <strong>{property.title}</strong>
                        <span>
                          {property.city} · {formatPrice(property)}
                        </span>
                      </span>
                      <Badge tone={STATUS_TONES[property.status]}>{STATUS_LABELS[property.status]}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="dashboard-grid__col">
          <section className="card">
            <div className="card__header">
              <h2>Needs attention</h2>
              <p>{isAdmin ? "Across the whole agency." : "On your leads, visits and deals."}</p>
            </div>
            <ul className="steps">
              {todos.map(({ href, icon: Icon, label, count }) => (
                <li key={href}>
                  <Link href={href} className={`step${count === 0 ? " step--done" : ""}`}>
                    <span className="step__number" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <span className="step__body">
                      <strong>{label}</strong>
                    </span>
                    <span className="step__count">{count}</span>
                    <ArrowRight size={16} className="step__arrow" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="card__header">
              <h2>Recent activity</h2>
              <p>Latest notes and changes on {isAdmin ? "all leads" : "your leads"}.</p>
            </div>
            {activity.length === 0 ? (
              <p className="muted">Nothing yet.</p>
            ) : (
              <ol className="timeline timeline--compact">
                {activity.map((entry) => {
                  const Icon = entry.kind === "activity" ? Activity : MessageSquare;
                  const href = entry.deal_id ? `/deals/${entry.deal_id}` : entry.visit_id ? `/visits/${entry.visit_id}` : `/leads/${entry.lead.id}`;
                  return (
                    <li key={entry.id} className={`timeline__item timeline__item--${entry.kind}`}>
                      <span className="timeline__icon" aria-hidden="true">
                        <Icon size={14} />
                      </span>
                      <div className="timeline__body">
                        <p className="timeline__text">
                          <Link href={href}>{entry.lead.name}</Link>: {entry.body}
                        </p>
                        <p className="timeline__meta">
                          {entry.user?.name ?? "System"} · {formatDateTime(entry.created_at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <section className="stats">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card skeleton-block skeleton-block--stat" />
        ))}
      </section>
      <div className="dashboard-grid">
        <div className="card skeleton-block skeleton-block--panel" />
        <div className="card skeleton-block skeleton-block--panel" />
      </div>
    </div>
  );
}
