import { useState } from "react";
import { Panel, Btn, LinkBtn } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { DRIVE_URL, PARENT_FOLDER } from "@/domain/seed";
import type { EventWorkspaceData, GenerationState } from "@/domain/types";

export function SlidesTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const deck = data.deck;
  const [state, setState] = useState<GenerationState[]>(() => deck.map((_, i) => (i < 5 ? "done" : "idle")));
  const [ts, setTs] = useState("28 Oct 14:20");

  const setAt = (i: number, v: GenerationState) => setState((s) => s.map((x, j) => (j === i ? v : x)));
  const gen = (i: number) => {
    setAt(i, "working");
    setTimeout(() => {
      setAt(i, "done");
      setTs("1 Nov 10:42");
    }, 900);
  };
  const genAll = () => {
    state.forEach((s, i) => {
      if (s !== "done") setTimeout(() => gen(i), i * 160);
    });
    toast("Generating deck from live event data…", "accent");
  };
  const done = state.filter((s) => s === "done").length;

  return (
    <div className="flex flex-col gap-5">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--warn-sft)", color: "var(--warn)" }}>
              <Icon name="slides" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Event Presentation Deck</h2>
              <p className="text-sm text-muted">
                {done} of {deck.length} slides generated · Google Slides · merged from agenda, teams & stations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkBtn variant="outlineGood" icon="external" size="sm" href={DRIVE_URL}>Open in Google Slides</LinkBtn>
            <Btn variant="secondary" icon="folder" size="sm" onClick={() => toast("Deck synced to Drive folder", "good")}>Sync to Drive</Btn>
            <Btn variant="primary" icon="bolt" size="sm" onClick={genAll}>Generate all</Btn>
          </div>
        </div>
        <div className="mt-3 rounded-lg p-2.5 text-xs flex items-center gap-2 font-mono text-muted" style={{ background: "var(--surface-2)" }}>
          <Icon name="folder" className="w-3.5 h-3.5 shrink-0 text-accent" />
          {PARENT_FOLDER} / {data.event.name} / Decks · last generated {ts}
        </div>
      </Panel>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {deck.map((title, i) => {
          const s = state[i];
          return (
            <div key={i} className="rounded-xl overflow-hidden flex flex-col shadow-card" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="relative flex items-center justify-center" style={{ aspectRatio: "16/9", background: s === "done" ? "var(--accent)" : "var(--surface-2)" }}>
                <span className="absolute top-2 left-2 text-[10px] font-mono font-bold rounded px-1.5 py-0.5" style={{ background: "rgba(0,0,0,.25)", color: s === "done" ? "#fff" : "var(--faint)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s === "working" ? (
                  <span className="w-6 h-6 rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
                ) : (
                  <div className="px-3 text-center text-xs font-semibold leading-snug" style={{ color: s === "done" ? "#fff" : "var(--faint)" }}>
                    {title}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2 gap-2">
                <span className="text-xs font-medium truncate text-muted">
                  {s === "done" ? "Generated" : s === "working" ? "Generating…" : "Not generated"}
                </span>
                {s === "idle" && (
                  <button onClick={() => gen(i)} className="text-xs font-semibold shrink-0 text-accent">Generate</button>
                )}
                {s === "done" && (
                  <button onClick={() => gen(i)} className="text-xs font-semibold shrink-0 text-faint">Regenerate</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
