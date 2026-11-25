import { useState } from "react";
import { Card, Pill, Btn, SectionHead, inputStyle } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { PRODUCERS, FACILITATOR_POOL, type EventWorkspaceData, type Station } from "@/domain/types";

export function MappingTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const [stations, setStations] = useState<Station[]>(() => data.stations.map((s) => ({ ...s, facilitators: [...s.facilitators] })));

  const setProducer = (i: number, v: string) => setStations((m) => m.map((s, j) => (j === i ? { ...s, producer: v } : s)));
  const addFac = (i: number, v: string) => {
    if (!v) return;
    setStations((m) => m.map((s, j) => (j === i && !s.facilitators.includes(v) ? { ...s, facilitators: [...s.facilitators, v] } : s)));
  };
  const removeFac = (i: number, v: string) => setStations((m) => m.map((s, j) => (j === i ? { ...s, facilitators: s.facilitators.filter((x) => x !== v) } : s)));
  const unstaffed = stations.filter((s) => s.producer === "—").length;

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Station & Role Mapping"
        desc="Assign one full-time producer and any part-time facilitators to each challenge station."
        right={<Btn variant="secondary" icon="download" onClick={() => toast("Crew sheet exported to Google Sheets", "good")}>Export crew sheet</Btn>}
      />
      {unstaffed > 0 && (
        <div className="rounded-lg p-3 text-sm flex items-center gap-2.5" style={{ background: "var(--warn-sft)", color: "var(--warn)" }}>
          <Icon name="alert" className="w-4 h-4 shrink-0" />
          {unstaffed} station still needs a lead producer.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        {stations.map((s, i) => (
          <Card key={s.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold" style={{ background: "var(--teal-sft)", color: "var(--teal)" }}>
                  {s.id}
                </span>
                <div>
                  <div className="font-semibold leading-tight">{s.name}</div>
                  <div className="text-xs font-mono mt-0.5 text-faint">{s.room}</div>
                </div>
              </div>
              <Pill tone={s.producer === "—" ? "warn" : "good"} dot>
                {s.producer === "—" ? "No lead" : "Staffed"}
              </Pill>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1 text-accent">Full-Time Producer (Lead)</div>
              <select value={s.producer} onChange={(e) => setProducer(i, e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle}>
                <option value="—">— Unassigned —</option>
                {PRODUCERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1 text-teal">Part-Time Facilitators</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {s.facilitators.length === 0 && <span className="text-xs text-faint">None yet</span>}
                {s.facilitators.map((fc) => (
                  <span key={fc} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--teal-sft)", color: "var(--teal)" }}>
                    {fc}
                    <button onClick={() => removeFac(i, fc)} className="hover:opacity-70" aria-label="Remove">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select value="" onChange={(e) => addFac(i, e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle}>
                <option value="">+ Add facilitator…</option>
                {FACILITATOR_POOL.filter((fc) => !s.facilitators.includes(fc)).map((fc) => (
                  <option key={fc} value={fc}>{fc}</option>
                ))}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
