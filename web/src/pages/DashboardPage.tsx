import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, StatusPill, Bar, Btn } from "@/components/ui";
import { Icon, type IconName } from "@/lib/icons";
import { listEvents } from "@/lib/api";
import { fmtRange } from "@/lib/format";
import type { EventSummary } from "@/domain/types";

function KPI({ label, value, sub, tone, icon }: { label: string; value: number; sub: string; tone: string; icon: IconName }) {
  return (
    <Card className="flex-1 min-w-[150px]">
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold text-muted">{label}</div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `var(--${tone}-sft)`, color: `var(--${tone})` }}>
          <Icon name={icon} className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 text-3xl font-bold font-mono tnum">{value}</div>
      <div className="mt-1 text-xs text-faint">{sub}</div>
    </Card>
  );
}

function EventRow({ ev, onOpen }: { ev: EventSummary; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left grid grid-cols-[1fr_auto] md:grid-cols-[2.2fr_1.3fr_1fr_auto_auto] gap-3 md:gap-4 items-center px-4 py-3.5 rounded-xl transition-colors hover:bg-surface2"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="min-w-0">
        <div className="font-semibold truncate">{ev.name}</div>
        <div className="text-xs mt-0.5 truncate text-muted">
          {ev.client} · {ev.teams} teams
        </div>
      </div>
      <div className="hidden md:block text-sm min-w-0 text-muted">
        <div className="flex items-center gap-1.5 truncate">
          <Icon name="pin" className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{ev.city}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs">
          <Icon name="calendar" className="w-3.5 h-3.5 shrink-0" />
          {fmtRange(ev.start, ev.end)}
        </div>
      </div>
      <div className="hidden md:block">
        <StatusPill s={ev.status} />
      </div>
      <div className="hidden md:flex items-center gap-2 w-28">
        <Bar value={ev.readiness} />
        <span className="font-mono text-xs tnum w-9 text-right text-muted">{ev.readiness}%</span>
      </div>
      <div className="justify-self-end flex items-center gap-3">
        <div className="md:hidden">
          <StatusPill s={ev.status} />
        </div>
        <Icon name="chevR" className="w-4 h-4 text-faint" />
      </div>
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"Active" | "Complete" | "All">("Active");

  useEffect(() => {
    listEvents().then(setEvents);
  }, []);

  const active = events.filter((e) => e.status !== "Complete");
  const needs = events.filter((e) => ["Planning", "Draft"].includes(e.status) && e.readiness < 80).length;
  const filtered = events.filter((e) => {
    if (filter === "Active" && e.status === "Complete") return false;
    if (filter === "Complete" && e.status !== "Complete") return false;
    return e.name.toLowerCase().includes(q.toLowerCase()) || e.client.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="fadeup flex flex-col gap-6 py-6" style={{ paddingLeft: "max(20px,env(safe-area-inset-left,0px))", paddingRight: "max(20px,env(safe-area-inset-right,0px))" }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ textWrap: "balance" }}>
            Operations Dashboard
          </h1>
          <p className="text-sm mt-1 text-muted">
            {active.length} active events · {active.reduce((s, e) => s + e.pax, 0)} delegates in the pipeline
          </p>
        </div>
        <Btn icon="plus" size="lg" onClick={() => navigate("/events/new")}>
          New event
        </Btn>
      </div>

      <div className="flex flex-wrap gap-3">
        <KPI label="Upcoming events" value={active.length} sub="next 90 days" tone="info" icon="calendar" />
        <KPI label="Needs attention" value={needs} sub="readiness below 80%" tone="warn" icon="alert" />
        <KPI label="Crew to confirm" value={3} sub="producers & facilitators" tone="teal" icon="users" />
        <KPI label="Deliverables due" value={9} sub="across active events" tone="crit" icon="doc" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Events</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="rounded-lg pl-9 pr-3 py-2 text-sm w-44 sm:w-60" style={{ background: "var(--surface)", border: "1px solid var(--border-2)", color: "var(--text)" }} />
            </div>
            <div className="flex rounded-lg p-0.5" style={{ background: "var(--surface-2)" }}>
              {(["Active", "Complete", "All"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors" style={filter === f ? { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow)" } : { color: "var(--muted)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map((ev) => (
            <EventRow key={ev.id} ev={ev} onOpen={() => navigate(`/events/${ev.id}`)} />
          ))}
          {filtered.length === 0 && <Card className="text-center text-sm text-muted">No events match.</Card>}
        </div>
      </div>
    </div>
  );
}
