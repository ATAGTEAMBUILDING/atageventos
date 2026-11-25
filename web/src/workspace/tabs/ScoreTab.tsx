import { useState } from "react";
import { Card, Panel, Btn, LinkBtn, inputStyle } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { DRIVE_URL } from "@/domain/seed";
import type { EventWorkspaceData, TeamScore } from "@/domain/types";

const medal = ["var(--gold)", "var(--faint)", "#B06A2E"];

export function ScoreTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const { teams, challenges } = data;
  const [scores, setScores] = useState<Record<string, TeamScore>>(() => Object.fromEntries(data.scores.map((s) => [s.teamId, { ...s, points: { ...s.points } }])));

  const total = (s: TeamScore) => challenges.reduce((t, c) => t + (Number(s.points[c.key]) || 0), 0) + (s.bonus || 0) - (s.penalty || 0);
  const setVal = (tid: string, key: string, v: string, max: number) => {
    const n = Math.max(0, Math.min(max, Number(v) || 0));
    setScores((st) => ({ ...st, [tid]: { ...st[tid], points: { ...st[tid].points, [key]: n } } }));
  };
  const step = (tid: string, field: "bonus" | "penalty", d: number) =>
    setScores((st) => ({ ...st, [tid]: { ...st[tid], [field]: Math.max(0, (st[tid][field] || 0) + d) } }));

  if (teams.length === 0) {
    return <div className="rounded-xl p-6 text-sm text-muted" style={{ border: "1px dashed var(--border-2)" }}>No teams yet — add competing teams to start scoring.</div>;
  }

  const ranked = [...teams].map((t) => ({ ...t, total: total(scores[t.id]) })).sort((a, b) => b.total - a.total);
  const leader = ranked[0];
  const lead = ranked[0].total - (ranked[1]?.total ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">
              Live Tournament Score Sheet Matrix <span className="text-sm font-normal text-muted">· {teams.length} Teams · {challenges.length} Challenge Rounds</span>
            </h2>
            <p className="text-sm mt-0.5 text-muted">Real-time score tabulations, automatic leaderboard rank positioning, and Google Sheets sync.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkBtn variant="outlineGood" icon="external" size="sm" href={DRIVE_URL}>Open in Google Sheets</LinkBtn>
            <Btn variant="good" icon="sheet" size="sm" onClick={() => toast("Scores synced to Google Sheets", "good")}>Sync to Google Sheets</Btn>
            <Btn variant="secondary" icon="plus" size="sm" onClick={() => toast("Add team (stub)", "accent")}>Add Team</Btn>
          </div>
        </div>
      </Panel>

      <div className="rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between" style={{ background: "var(--gold-sft)", border: "1px solid var(--gold)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: "var(--gold)" }}>
            <Icon name="trophy" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-gold">Tournament Leader (Rank #1) · {leader.total} Points</div>
            <div className="font-bold text-lg">{leader.name}</div>
          </div>
        </div>
        <div className="text-sm font-semibold inline-flex items-center gap-1.5 text-gold">
          <Icon name="bolt" className="w-4 h-4" />
          {lead > 0 ? `Leading by ${lead} pts` : "Tied for the lead"}
        </div>
      </div>

      <Card pad={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 860 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-muted">Rank</th>
                <th className="text-left px-3 py-3 text-xs font-semibold uppercase text-muted">Team</th>
                {challenges.map((c) => (
                  <th key={c.key} className="px-2 py-3 text-xs font-semibold text-center text-muted">
                    {c.label}
                    <div className="font-normal font-mono text-[10px] text-faint">Max {c.max}</div>
                  </th>
                ))}
                <th className="px-2 py-3 text-xs font-semibold text-center text-muted">Bonus</th>
                <th className="px-2 py-3 text-xs font-semibold text-center text-muted">Penalty</th>
                <th className="px-3 py-3 text-xs font-semibold text-right text-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((t, ri) => {
                const s = scores[t.id];
                return (
                  <tr key={t.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-3 py-2.5">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono" style={ri < 3 ? { background: medal[ri], color: "#fff" } : { color: "var(--muted)" }}>
                        {ri + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2 font-semibold min-w-[130px]">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                        {t.name}
                      </div>
                    </td>
                    {challenges.map((c) => (
                      <td key={c.key} className="px-2 py-2.5 text-center">
                        <input type="number" value={s.points[c.key] ?? 0} onChange={(e) => setVal(t.id, c.key, e.target.value, c.max)} className="w-14 text-center rounded-md py-1 text-sm font-mono tnum" style={inputStyle} />
                      </td>
                    ))}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => step(t.id, "bonus", -5)} className="w-5 h-5 rounded font-bold" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>–</button>
                        <span className="font-mono tnum w-8 text-center text-good">+{s.bonus}</span>
                        <button onClick={() => step(t.id, "bonus", 5)} className="w-5 h-5 rounded font-bold" style={{ background: "var(--good-sft)", color: "var(--good)" }}>+</button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => step(t.id, "penalty", -5)} className="w-5 h-5 rounded font-bold" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>–</button>
                        <span className="font-mono tnum w-8 text-center text-crit">-{s.penalty}</span>
                        <button onClick={() => step(t.id, "penalty", 5)} className="w-5 h-5 rounded font-bold" style={{ background: "var(--crit-sft)", color: "var(--crit)" }}>+</button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold font-mono tnum text-base">{t.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-faint">Edit any cell — totals and the leaderboard re-rank instantly. In production this mirrors the master Google Sheet.</p>
    </div>
  );
}
