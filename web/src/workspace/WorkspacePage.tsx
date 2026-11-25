import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon, type IconName } from "@/lib/icons";
import { StatusPill } from "@/components/ui";
import { useToast } from "@/lib/toast";
import { getWorkspace, isFeatureEvent } from "@/lib/api";
import { fmtRange } from "@/lib/format";
import { PARENT_FOLDER } from "@/domain/seed";
import type { EventWorkspaceData } from "@/domain/types";

import { OverviewTab } from "./tabs/OverviewTab";
import { FlowTab } from "./tabs/FlowTab";
import { MappingTab } from "./tabs/MappingTab";
import { CrewTab } from "./tabs/CrewTab";
import { ScoreTab } from "./tabs/ScoreTab";
import { SlidesTab } from "./tabs/SlidesTab";
import { PackingTab } from "./tabs/PackingTab";
import { ProcurementTab } from "./tabs/ProcurementTab";
import { RotationTab } from "./tabs/RotationTab";

export interface TabProps {
  data: EventWorkspaceData;
}

const TABS: { id: string; label: string; icon: IconName; color: string }[] = [
  { id: "overview", label: "Overview & Drive Hub", icon: "grid", color: "var(--accent)" },
  { id: "flow", label: "Event Flow & Roles", icon: "clock", color: "var(--crit)" },
  { id: "mapping", label: "Station & Role Mapping", icon: "users", color: "var(--teal)" },
  { id: "crew", label: "Crew Hiring", icon: "badge", color: "var(--accent)" },
  { id: "score", label: "Score Sheet", icon: "sheet", color: "var(--good)" },
  { id: "slides", label: "Event Slides", icon: "slides", color: "var(--warn)" },
  { id: "packing", label: "Packing Checklist", icon: "box", color: "var(--info)" },
  { id: "procurement", label: "Procurement & Budget", icon: "cart", color: "var(--good)" },
  { id: "rotation", label: "Teams Rotation Tool", icon: "rotate", color: "var(--purple)" },
];

function renderTab(id: string, data: EventWorkspaceData, goTab: (t: string) => void) {
  switch (id) {
    case "overview": return <OverviewTab data={data} goTab={goTab} />;
    case "flow": return <FlowTab data={data} />;
    case "mapping": return <MappingTab data={data} />;
    case "crew": return <CrewTab data={data} />;
    case "score": return <ScoreTab data={data} />;
    case "slides": return <SlidesTab data={data} />;
    case "packing": return <PackingTab data={data} />;
    case "procurement": return <ProcurementTab data={data} />;
    case "rotation": return <RotationTab data={data} />;
    default: return <OverviewTab data={data} goTab={goTab} />;
  }
}

export function WorkspacePage() {
  const { eventId = "e1", tab = "overview" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState<EventWorkspaceData | null>(null);

  useEffect(() => {
    let live = true;
    getWorkspace(eventId).then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, [eventId]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent mr-2" style={{ animation: "spin .7s linear infinite" }} />
        Loading workspace…
      </div>
    );
  }

  const ev = data.event;
  const feature = isFeatureEvent(ev.id);
  const goTab = (t: string) => navigate(`/events/${eventId}/${t}`);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="sticky z-20 border-b backdrop-blur" style={{ top: "env(safe-area-inset-top,0px)", borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 90%, transparent)" }}>
        <div className="flex items-center justify-between gap-3 h-[72px]" style={{ paddingLeft: "max(20px,env(safe-area-inset-left,0px))", paddingRight: "max(20px,env(safe-area-inset-right,0px))" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "var(--accent)" }}>
              OP
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap text-muted">
                <span className="font-semibold text-ink">{ev.client}</span>
                {feature && (
                  <>
                    <span className="text-faint">·</span>
                    <span className="text-accent">{ev.codename}</span>
                  </>
                )}
                <span className="text-faint">·</span>
                <span className="font-mono">{ev.start}</span>
              </div>
              <div className="font-bold truncate">{ev.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toast(`Synced all deliverables to ${PARENT_FOLDER} / ${ev.name}`, "good")}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-3.5 py-2 text-white"
              style={{ background: "var(--accent)" }}
            >
              <Icon name="folder" className="w-4 h-4" />
              Sync All to Google Drive
            </button>
            <button onClick={() => navigate("/")} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface2 text-muted" aria-label="Close event">
              ✕
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max" style={{ paddingLeft: "max(20px,env(safe-area-inset-left,0px))", paddingRight: "max(20px,env(safe-area-inset-right,0px))" }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => goTab(t.id)} className="flex items-center gap-2 px-3 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap" style={tab === t.id ? { borderColor: t.color, color: t.color } : { borderColor: "transparent", color: "var(--muted)" }}>
                <Icon name={t.icon} className="w-4 h-4" style={{ color: tab === t.id ? t.color : "var(--faint)" }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!feature && (
        <div className="px-5 pt-4">
          <div className="rounded-lg p-3 text-xs flex items-center gap-2.5 max-w-3xl" style={{ background: "var(--info-sft)", color: "var(--info)" }}>
            <Icon name="alert" className="w-4 h-4 shrink-0" />
            Prototype: tab content below shows the fully worked “{ev.codename}” dataset. Open the headline Grab event from the dashboard for the matched example.
          </div>
        </div>
      )}

      <div className="py-6 fadeup" key={tab} style={{ paddingLeft: "max(20px,env(safe-area-inset-left,0px))", paddingRight: "max(20px,env(safe-area-inset-right,0px))" }}>
        {renderTab(tab, data, goTab)}
      </div>
    </div>
  );
}
