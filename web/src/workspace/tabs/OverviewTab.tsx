import type { ReactNode } from "react";
import { Card, Panel, Bar, Btn, LinkBtn, SectionHead } from "@/components/ui";
import { Icon, type IconName } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { fmtDate } from "@/lib/format";
import { DRIVE_URL, PARENT_FOLDER } from "@/domain/seed";
import type { EventWorkspaceData } from "@/domain/types";

function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub: string }) {
  return (
    <Card className="flex-1 min-w-[160px]">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold tnum">{value}</div>
      <div className="mt-1.5 text-xs text-faint">{sub}</div>
    </Card>
  );
}

function Deliverable({ icon, tone, title, meta, action, href, onAction }: { icon: IconName; tone: string; title: string; meta: string; action: string; href?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl p-4" style={{ border: "1px solid var(--border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `var(--${tone}-sft)`, color: `var(--${tone})` }}>
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm truncate">{title}</div>
        <div className="text-xs mt-0.5 truncate text-muted">{meta}</div>
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold inline-flex items-center gap-1 shrink-0 hover:underline text-accent">
          {action}
          <Icon name="external" className="w-3.5 h-3.5" />
        </a>
      ) : (
        <button onClick={onAction} className="text-sm font-semibold shrink-0 hover:underline text-accent">
          {action}
        </button>
      )}
    </div>
  );
}

export function OverviewTab({ data, goTab }: { data: EventWorkspaceData; goTab: (t: string) => void }) {
  const toast = useToast();
  const ev = data.event;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <StatTile label="Headcount" value={<>{ev.pax} <span className="text-sm font-medium text-muted">Pax</span></>} sub={`${ev.teams} Competing Teams`} />
        <Card className="flex-1 min-w-[160px]">
          <div className="text-xs font-semibold text-muted">Ops Readiness</div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-bold tnum text-teal">{ev.readiness}%</span>
            <div className="flex-1">
              <Bar value={ev.readiness} />
            </div>
          </div>
          <div className="mt-1.5 text-xs font-medium text-good">Pre-Production in progress</div>
        </Card>
        <StatTile label="Lead Producer" value={ev.producer} sub={ev.producerRole} />
        <Card className="flex-1 min-w-[160px]">
          <div className="text-xs font-semibold text-muted">Date & Schedule</div>
          <div className="mt-2 text-lg font-bold tnum">{fmtDate(ev.start)}</div>
          <div className="mt-1 text-xs font-mono text-muted">{ev.time} · WIB</div>
        </Card>
      </div>

      <Panel>
        <SectionHead
          title="Google Workspace Deliverables & Hub"
          desc="Direct cloud file links, generated into the event's Drive folder for client and crew handoff."
          right={<LinkBtn variant="secondary" icon="folder" href={DRIVE_URL}>Open Master Google Drive Folder</LinkBtn>}
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Deliverable icon="slides" tone="warn" title="Event Presentation Decks" meta="12 Slides · Google Slides" action="Open Deck" href={DRIVE_URL} />
          <Deliverable icon="sheet" tone="good" title="Official Team Score Sheet" meta="Live Formulas · Master Google Sheet" action="Open Sheet" href={DRIVE_URL} />
          <Deliverable icon="doc" tone="info" title="Minute-by-Minute Run Sheet" meta="Full & Part-Time Roles · Google Docs Brief" action="Generate" onAction={() => toast("Run sheet generated to Drive folder", "good")} />
          <Deliverable icon="calendar" tone="purple" title="Calendar Schedule Event" meta="Operations Call Time · Google Calendar" action="Schedule" onAction={() => toast("Ops call added to Google Calendar", "accent")} />
        </div>
        <div className="mt-3 rounded-lg p-3 text-xs flex items-center gap-2.5 font-mono text-muted" style={{ background: "var(--surface-2)" }}>
          <Icon name="folder" className="w-4 h-4 shrink-0 text-accent" />
          Syncing to&nbsp;<b className="text-ink">{PARENT_FOLDER} / {ev.name} /</b>
        </div>
      </Panel>

      <Panel>
        <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-faint">Venue Location & Field Dispatch</div>
        <div className="flex items-start gap-3">
          <Icon name="pin" className="w-5 h-5 mt-0.5 shrink-0 text-crit" />
          <div>
            <div className="font-bold">{ev.venue}</div>
            <div className="text-sm text-muted">{ev.zone}</div>
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-faint">Station & Crew Allocation</div>
          <div className="text-sm text-muted">Map full-time producers and part-time facilitators to specific tournament challenge stations using dropdown selectors.</div>
        </div>
        <Btn variant="secondary" icon="users" onClick={() => goTab("mapping")}>
          Open Station Mapping
        </Btn>
      </Panel>
    </div>
  );
}
