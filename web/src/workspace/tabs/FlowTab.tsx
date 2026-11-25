import { useState } from "react";
import { Card, Panel, Pill, Btn, LinkBtn } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { patchFlow } from "@/lib/api";
import { DRIVE_URL } from "@/domain/seed";
import type { EventWorkspaceData, FlowBlock } from "@/domain/types";

function Block({ b, done, toggle, open, setOpen }: { b: FlowBlock; done: boolean; toggle: (id: number, blockId: string) => void; open: boolean; setOpen: (id: number | null) => void }) {
  const toast = useToast();
  return (
    <Card pad={false} className="overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <button onClick={() => toggle(b.id, b.blockId)} className="mt-0.5 shrink-0" aria-label="Mark step complete">
          <span className="w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={done ? { background: "var(--good)", color: "#fff" } : { border: "2px solid var(--border-2)" }}>
            {done && <Icon name="check" className="w-3.5 h-3.5" stroke={3} />}
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap text-muted">
            <span className="font-semibold text-ink">{b.start} – {b.end}</span>
            <span>·</span>
            <span>{b.durationMin} mins</span>
            <span>·</span>
            <Pill tone="info">{b.phase}</Pill>
          </div>
          <div className="font-bold mt-1.5">{b.title}</div>
          <div className="text-sm mt-1 text-muted">{b.description}</div>
        </div>
        <button onClick={() => setOpen(open ? null : b.id)} className="shrink-0 p-1 rounded hover:bg-surface2" aria-label="Toggle details">
          <Icon name="chevD" className="w-5 h-5 transition-transform text-faint" style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>
      </div>
      {open && (
        <div className="px-4 pb-4 fadeup">
          <div className="grid lg:grid-cols-2 gap-3">
            <div className="rounded-lg p-3.5" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-accent">
                  <Icon name="users" className="w-4 h-4" />
                  Full-Time Producer Duties
                </div>
                <button onClick={() => toast("Duty editor (stub)", "accent")} className="text-xs font-semibold text-accent">+ Add Duty</button>
              </div>
              <div className="flex flex-col gap-2">
                {b.producers.map((pr, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {pr.role} <span className="font-normal text-muted">({pr.who})</span>
                      </div>
                      <button onClick={() => toast("Edit duties (stub)", "accent")} className="text-xs font-semibold inline-flex items-center gap-1 text-accent">
                        <Icon name="edit" className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mt-2 mb-1 text-good">Assigned Operational Duties</div>
                    <ul className="text-sm flex flex-col gap-1">
                      {pr.duties.map((d, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-faint">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg p-3.5" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-teal">
                  <Icon name="users" className="w-4 h-4" />
                  Part-Time Facilitator Assignments
                </div>
                <button onClick={() => toast("Assignment editor (stub)", "accent")} className="text-xs font-semibold text-accent">+ Add Assignment</button>
              </div>
              <div className="flex flex-col gap-2">
                {b.facilitators.map((fa, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {fa.role} <Pill tone="good">{fa.stations}</Pill>
                      </div>
                      <button onClick={() => toast("Edit assignment (stub)", "accent")} className="text-xs font-semibold inline-flex items-center gap-1 shrink-0 text-teal">
                        <Icon name="edit" className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                    <div className="text-xs mt-1.5 text-muted">
                      Assigned Crew: <b className="text-ink">{fa.crew?.join(", ")}</b>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mt-2 mb-1 text-teal">Facilitator Duties & Tasks</div>
                    <ul className="text-sm flex flex-col gap-1">
                      {fa.duties.map((d, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-faint">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm flex items-start gap-2 flex-wrap">
            <span className="font-semibold inline-flex items-center gap-1.5 text-muted">
              <Icon name="box" className="w-4 h-4" />
              Critical Props/Gear:
            </span>
            <span className="text-muted">{b.gear.join(" · ")}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export function FlowTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const [doneSet, setDoneSet] = useState<Set<number>>(() => new Set(data.flow.filter((b) => b.completed).map((b) => b.id)));
  const [open, setOpen] = useState<number | null>(1);
  const [phase, setPhase] = useState("All");
  const flow = data.flow;
  const toggle = (id: number, blockId: string) => {
    const completed = !doneSet.has(id);
    setDoneSet((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    patchFlow(blockId, completed).catch(() => toast("Couldn't save — check connection", "crit"));
  };
  const phases = ["All", ...flow.map((b) => b.phase)];
  const list = phase === "All" ? flow : flow.filter((b) => b.phase === phase);

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Minute-by-Minute Operational Event Flow</h2>
            <p className="text-sm mt-0.5 max-w-md text-muted">Synchronised timeline allocating exact duties for full-time producers and part-time facilitators.</p>
            <div className="mt-2 text-sm font-semibold font-mono text-accent">
              {doneSet.size}/{flow.length} Steps Completed
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="secondary" icon="copy" size="sm" onClick={() => toast("Briefing run-sheet copied", "accent")}>Copy Briefing Run-Sheet</Btn>
            <LinkBtn variant="outlineInfo" icon="doc" size="sm" href={DRIVE_URL}>Export Google Docs</LinkBtn>
            <LinkBtn variant="outlineGood" icon="sheet" size="sm" href={DRIVE_URL}>Export Google Sheets</LinkBtn>
            <Btn variant="primary" icon="plus" size="sm" onClick={() => toast("Add flow block (stub)", "accent")}>Add Flow Block</Btn>
          </div>
        </div>
      </Panel>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {phases.map((p) => {
          const n = p === "All" ? flow.length : flow.filter((b) => b.phase === p).length;
          return (
            <button key={p} onClick={() => setPhase(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap" style={phase === p ? { background: "var(--accent)", color: "#fff" } : { background: "var(--surface)", border: "1px solid var(--border-2)", color: "var(--muted)" }}>
              {p === "All" ? "All Timeline" : p} ({n})
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-3">
        {list.map((b) => (
          <Block key={b.id} b={b} done={doneSet.has(b.id)} toggle={toggle} open={open === b.id} setOpen={setOpen} />
        ))}
      </div>
    </div>
  );
}
