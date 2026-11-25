import { useState } from "react";
import { Card, Pill, Btn, SectionHead, type Tone } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import type { EventWorkspaceData, CrewMember, CrewStatus } from "@/domain/types";

const statusTone: Record<CrewStatus, Tone> = { Confirmed: "good", Pending: "warn", Unfilled: "crit" };

export function CrewTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const [crew, setCrew] = useState<CrewMember[]>(data.crew);
  const confirmed = crew.filter((c) => c.status === "Confirmed").length;
  const unfilled = crew.filter((c) => c.status === "Unfilled").length;
  const dailyCost = crew.filter((c) => c.status !== "Unfilled").reduce((s, c) => s + (Number(c.rate.replace(/[^\d]/g, "")) || 0), 0);

  const nudge = (name: string) => toast(`Reminder sent to ${name} via Facilitator App`, "accent");
  const post = (idx: number) => {
    setCrew((cs) => cs.map((x, i) => (i === idx ? { ...x, name: "Role posted", status: "Pending" } : x)));
    toast("Open role posted to Facilitator App", "accent");
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHead title="Crew Hiring" desc={`${confirmed} of ${crew.length} confirmed · hiring, contracting & payment managed in your Facilitator App`} />
      <div className="flex flex-wrap gap-3">
        <Card className="flex-1 min-w-[150px]">
          <div className="text-xs font-semibold text-muted">Confirmed crew</div>
          <div className="mt-2 text-2xl font-bold tnum">
            {confirmed}
            <span className="text-sm font-medium text-muted"> / {crew.length}</span>
          </div>
        </Card>
        <Card className="flex-1 min-w-[150px]">
          <div className="text-xs font-semibold text-muted">Open roles</div>
          <div className="mt-2 text-2xl font-bold tnum" style={{ color: unfilled ? "var(--crit)" : "var(--good)" }}>
            {unfilled}
          </div>
        </Card>
        <Card className="flex-1 min-w-[150px]">
          <div className="text-xs font-semibold text-muted">Daily crew cost</div>
          <div className="mt-2 text-2xl font-bold tnum font-mono">RM {dailyCost.toLocaleString()}</div>
        </Card>
      </div>
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between" style={{ background: "var(--accent-sft)", border: "1px solid var(--accent)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>
            <Icon name="link" className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <div className="font-bold text-accent2">Connected to Facilitator App</div>
            <div className="text-accent">Profiles, rates, contracts & availability live there. This view is read-only + request actions.</div>
          </div>
        </div>
        <Btn variant="secondary" icon="external" onClick={() => toast("Opening Facilitator App…", "accent")}>
          Open app
        </Btn>
      </div>
      <Card pad={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {["Crew member", "Role", "Type", "Day rate", "Rating", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crew.map((c, i) => {
                const empty = c.name === "—";
                return (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-medium">{empty ? <span className="text-faint">Unassigned</span> : c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.role}</td>
                    <td className="px-4 py-3">
                      <Pill tone={c.type === "Full-time" ? "accent" : "teal"}>{c.type}</Pill>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.rate}</td>
                    <td className="px-4 py-3 font-mono tnum" style={{ color: c.rating ? "var(--text)" : "var(--faint)" }}>
                      {c.rating ? `★ ${c.rating}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={statusTone[c.status]} dot>{c.status}</Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === "Pending" && (
                        <button onClick={() => nudge(c.name)} className="text-xs font-semibold hover:underline text-accent">Nudge</button>
                      )}
                      {c.status === "Unfilled" && (
                        <button onClick={() => post(i)} className="text-xs font-semibold hover:underline text-accent">Post role</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-faint">
        Prototype note: hiring, contracting and payment stay in the existing Facilitator App. EventOps reads confirmed assignments and can post open roles back — shown here as stubbed actions. Station duties are set on the Station & Role Mapping tab.
      </p>
    </div>
  );
}
