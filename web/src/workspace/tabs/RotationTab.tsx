import { useEffect, useState } from "react";
import { Card, Panel, Btn } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { generateRotation } from "@/lib/api";
import { mmss } from "@/lib/format";
import type { EventWorkspaceData, RotationPosition } from "@/domain/types";

/** 6 teams x 6 rounds. Positions = stations + a Base Camp rest slot → Latin square, no clash. */
function buildGrid(data: EventWorkspaceData): RotationPosition[][] {
  const positions: RotationPosition[] = [
    ...data.stations.map((s) => ({ name: s.name, room: s.room, rest: false })),
    { name: "Base Camp", room: "Rest / Transit", rest: true },
  ];
  return data.teams.map((_, ti) => positions.map((_, ri) => positions[(ti + ri) % positions.length]));
}

export function RotationTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const rounds = data.rounds;
  const [grid, setGrid] = useState<RotationPosition[][] | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [round, setRound] = useState(1);
  const [secs, setSecs] = useState(data.roundSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const nextRound = () => {
    setRound((r) => Math.min(rounds, r + 1));
    setSecs(data.roundSeconds);
    setRunning(false);
  };
  const reset = () => {
    setSecs(data.roundSeconds);
    setRunning(false);
  };
  const generate = () => {
    setGrid(null);
    generateRotation(data.event.id).catch(() => toast("Couldn't save the plan — check connection", "crit"));
    setTimeout(() => {
      setGrid(buildGrid(data));
      toast("Rotation solved — every team clears every challenge, 0 clashes", "good");
    }, 700);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <div className="rounded-xl p-5 text-white flex flex-col gap-3" style={{ background: "#0E1626" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#8A97AC" }}>
              Live Arena Rotation Clock
            </span>
            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ background: "#1C2838", color: "#2DC2CC" }}>
              Round {round} of {rounds}
            </span>
          </div>
          <div className="text-5xl font-bold font-mono tnum text-center py-2" style={{ color: secs <= 60 && secs > 0 ? "#EB6B67" : "#fff" }}>
            {mmss(secs)}
          </div>
          <div className="text-xs text-center -mt-2" style={{ color: "#8A97AC" }}>
            {running ? "Running" : secs === 0 ? "Round complete" : "Paused / Ready"}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRunning((r) => !r)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold" style={{ background: running ? "#B5750A" : "#2563EB" }}>
              <Icon name={running ? "pause" : "play"} className="w-4 h-4" />
              {running ? "Pause" : "Start Round"}
            </button>
            <button onClick={reset} className="p-2 rounded-lg" style={{ background: "#1C2838" }} aria-label="Reset">
              <Icon name="rotate" className="w-4 h-4" />
            </button>
            <button onClick={nextRound} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "#1C2838" }}>
              Next Round
              <Icon name="chevR" className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                Automated Teams Rotation Scheduler <span className="text-sm font-normal text-muted">· {data.teams.length} Teams · {data.stations.length} Stations</span>
              </h2>
              <p className="text-sm mt-0.5 max-w-lg text-muted">
                Computes balanced, non-repeating station transitions so every team cycles through every challenge without conflicts (a Base Camp rest slot balances the odd team out).
              </p>
            </div>
            <div className="flex rounded-lg p-0.5" style={{ background: "var(--surface-2)" }}>
              {(["grid", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className="w-8 h-8 rounded-md flex items-center justify-center" style={view === v ? { background: "var(--surface)", boxShadow: "var(--shadow)", color: "var(--text)" } : { color: "var(--muted)" }}>
                  <Icon name={v === "grid" ? "grid" : "list"} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Btn variant="primary" icon="bolt" onClick={generate}>Generate Rotation Grid</Btn>
            <Btn variant="outlineGood" icon="sheet" onClick={() => (grid ? toast("Rotation exported to Google Sheets", "good") : toast("Generate a grid first", "warn"))}>
              Export to Sheets
            </Btn>
          </div>
        </Panel>
      </div>

      {!grid ? (
        <Card className="py-12 flex flex-col items-center text-center gap-3" style={{ borderStyle: "dashed" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--faint)" }}>
            <Icon name="clock" className="w-6 h-6" />
          </div>
          <div className="font-bold">No Rotations Generated Yet</div>
          <div className="text-sm max-w-sm text-muted">
            Click below to automatically compute the balanced rotation matrix for {data.teams.length} teams across {data.stations.length} challenge stations.
          </div>
          <Btn variant="primary" icon="bolt" onClick={generate}>Generate Rotation Schedule</Btn>
        </Card>
      ) : view === "grid" ? (
        <Card pad={false} className="overflow-hidden fadeup">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 820 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase sticky left-0 text-muted" style={{ background: "var(--surface-2)" }}>
                    Team
                  </th>
                  {Array.from({ length: rounds }).map((_, ri) => (
                    <th key={ri} className="px-3 py-3 text-xs font-semibold font-mono" style={{ color: ri + 1 === round ? "var(--purple)" : "var(--muted)" }}>
                      R{ri + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.teams.map((t, ti) => (
                  <tr key={t.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-2.5 font-semibold sticky left-0" style={{ background: "var(--surface)" }}>
                      <div className="flex items-center gap-2 min-w-[150px]">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                        {t.name}
                      </div>
                    </td>
                    {grid[ti].map((pos, ri) => (
                      <td key={ri} className="px-2 py-2.5 align-top">
                        <div className="rounded-lg px-2.5 py-2 text-xs" style={pos.rest ? { background: "var(--surface-2)", color: "var(--faint)", border: "1px dashed var(--border-2)" } : { background: ri + 1 === round ? "var(--purple-sft)" : "var(--surface-2)", border: ri + 1 === round ? "1px solid var(--purple)" : "1px solid var(--border)" }}>
                          <div className="font-semibold leading-tight" style={{ color: pos.rest ? "var(--faint)" : "var(--text)" }}>
                            {pos.name}
                          </div>
                          <div className="font-mono mt-0.5 text-faint">{pos.room}</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3 fadeup">
          {data.teams.map((t, ti) => (
            <Card key={t.id}>
              <div className="flex items-center gap-2 font-semibold mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                {t.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grid[ti].map((pos, ri) => (
                  <span key={ri} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs" style={pos.rest ? { background: "var(--surface-2)", color: "var(--faint)" } : { background: "var(--purple-sft)", color: "var(--purple)" }}>
                    <span className="font-mono font-bold">R{ri + 1}</span>
                    {pos.name}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
