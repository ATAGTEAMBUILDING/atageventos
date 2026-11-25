import { useState } from "react";
import { Card, Pill, Bar, SectionHead } from "@/components/ui";
import { Icon } from "@/lib/icons";
import type { EventWorkspaceData, PackingGroup } from "@/domain/types";

export function PackingTab({ data }: { data: EventWorkspaceData }) {
  const [groups, setGroups] = useState<PackingGroup[]>(() => data.packing.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i })) })));
  const toggle = (gi: number, ii: number) =>
    setGroups((d) => d.map((g, j) => (j !== gi ? g : { ...g, items: g.items.map((it, k) => (k === ii ? { ...it, done: !it.done } : it)) })));

  const all = groups.flatMap((g) => g.items);
  const done = all.filter((i) => i.done).length;
  const pct = Math.round((done / all.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Packing & Load-out Checklist"
        desc={`${done} of ${all.length} items packed · tick as crates are loaded for field dispatch`}
        right={
          <div className="flex items-center gap-3">
            <div className="w-28">
              <Bar value={pct} />
            </div>
            <span className="font-mono text-sm tnum font-semibold">{pct}%</span>
          </div>
        }
      />
      <div className="grid md:grid-cols-2 gap-3">
        {groups.map((g, gi) => {
          const gd = g.items.filter((i) => i.done).length;
          return (
            <Card key={g.category}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold">{g.category}</div>
                <Pill tone={gd === g.items.length ? "good" : "neutral"}>
                  {gd}/{g.items.length}
                </Pill>
              </div>
              <div className="flex flex-col gap-1">
                {g.items.map((it, ii) => (
                  <button key={ii} onClick={() => toggle(gi, ii)} className="flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors hover:bg-surface2">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={it.done ? { background: "var(--good)", color: "#fff" } : { border: "1.5px solid var(--border-2)" }}>
                      {it.done && <Icon name="check" className="w-3.5 h-3.5" stroke={3} />}
                    </span>
                    <span className="text-sm" style={{ color: it.done ? "var(--muted)" : "var(--text)", textDecoration: it.done ? "line-through" : "none" }}>
                      {it.name}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
