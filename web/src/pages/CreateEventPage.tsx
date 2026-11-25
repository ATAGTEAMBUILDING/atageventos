import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Btn, Field, inputStyle } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { createEvent } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { PARENT_FOLDER } from "@/domain/seed";

const STEPS = ["Basics", "Teams", "Programme", "Review"];

export function CreateEventPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: "", client: "", codename: "", venue: "", city: "",
    date: "2026-05-14", time: "09:00 – 16:00", pax: "90", teams: "6", stations: "5", roundMin: "24",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const canNext = step !== 0 || (f.name.trim() !== "" && f.client.trim() !== "");

  async function finish() {
    const ev = await createEvent({
      name: f.name, client: f.client, codename: f.codename, venue: f.venue, city: f.city,
      date: f.date, pax: Number(f.pax) || 0, teams: Number(f.teams) || 0,
    });
    toast("Event created — folder scaffolded in Drive", "good");
    navigate(`/events/${ev.id}`);
  }

  return (
    <div className="fadeup py-6 max-w-3xl mx-auto w-full" style={{ paddingLeft: "max(20px,env(safe-area-inset-left,0px))", paddingRight: "max(20px,env(safe-area-inset-right,0px))" }}>
      <h1 className="text-2xl font-bold mb-1">Create a new event</h1>
      <p className="text-sm mb-6 text-muted">A workspace, Drive folder and the full deliverable set are scaffolded as you go.</p>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <Fragment key={s}>
            <button onClick={() => i <= step && setStep(i)} disabled={i > step} className="flex items-center gap-2 px-1 shrink-0">
              <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center font-mono" style={i < step ? { background: "var(--good)", color: "#fff" } : i === step ? { background: "var(--accent)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--faint)" }}>
                {i < step ? <Icon name="check" className="w-3.5 h-3.5" stroke={2.5} /> : i + 1}
              </span>
              <span className="text-sm font-semibold hidden sm:inline" style={{ color: i === step ? "var(--text)" : "var(--muted)" }}>
                {s}
              </span>
            </button>
            {i < STEPS.length - 1 && <div className="h-px flex-1 min-w-4" style={{ background: "var(--border-2)" }} />}
          </Fragment>
        ))}
      </div>

      <Card className="min-h-[300px]">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Event name">
                <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Grab Engineering Leadership Summit 2026" className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
              </Field>
            </div>
            <Field label="Client / sponsor">
              <input value={f.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Grab Holdings" className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Theme / codename">
              <input value={f.codename} onChange={(e) => set("codename", e.target.value)} placeholder="e.g. The Island Escape Expedition" className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Venue">
              <input value={f.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Bintan Lagoon Adventure Camp" className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="City / region">
              <input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Riau Islands" className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Event date">
              <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Operating window">
              <input value={f.time} onChange={(e) => set("time", e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Delegates (pax)">
              <input type="number" value={f.pax} onChange={(e) => set("pax", e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Competing teams" hint="Delegates split evenly across teams.">
              <input type="number" value={f.teams} onChange={(e) => set("teams", e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <div className="sm:col-span-2 rounded-lg p-4 text-sm flex items-start gap-3" style={{ background: "var(--surface-2)" }}>
              <Icon name="users" className="w-5 h-5 mt-0.5 shrink-0 text-teal" />
              <div>
                <div className="font-semibold">Team roster</div>
                <div className="mt-0.5 text-muted">
                  {f.pax || 0} delegates ÷ {f.teams || 0} teams ≈ <b className="font-mono">{Number(f.teams) > 0 ? Math.ceil(Number(f.pax) / Number(f.teams)) : 0}</b> per team. Names import from the client sheet after creation.
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Challenge stations">
              <input type="number" value={f.stations} onChange={(e) => set("stations", e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Minutes per round">
              <input type="number" value={f.roundMin} onChange={(e) => set("roundMin", e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle} />
            </Field>
            <Field label="Format">
              <select defaultValue="Tournament rotation" className="rounded-lg px-3 py-2 text-sm w-full" style={inputStyle}>
                <option>Tournament rotation</option>
                <option>Fixed tracks</option>
                <option>Plenary + breakouts</option>
              </select>
            </Field>
            <p className="sm:col-span-3 text-xs text-faint">
              With {f.teams || 0} teams over {f.stations || 0} stations, the rotation tool adds a Base Camp rest slot so every team clears every challenge with no clash.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>
                <Icon name="calendar" className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg">{f.name || "Untitled event"}</div>
                <div className="text-sm text-muted">
                  {f.client || "—"}
                  {f.codename ? ` · ${f.codename}` : ""}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm rounded-lg p-4" style={{ background: "var(--surface-2)" }}>
              {[
                ["Venue", `${f.venue || "TBD"}, ${f.city || "—"}`],
                ["Date", fmtDate(f.date)],
                ["Window", f.time],
                ["Delegates", `${f.pax || 0} · ${f.teams || 0} teams`],
                ["Programme", `${f.stations || 0} stations × ${f.roundMin || 0} min`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b pb-2" style={{ borderColor: "var(--border)" }}>
                  <span className="text-muted">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-3 text-xs flex items-start gap-2.5" style={{ background: "var(--accent-sft)", color: "var(--accent-2)" }}>
              <Icon name="folder" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                A folder <b className="font-mono">{PARENT_FOLDER} / {f.name || "Untitled event"}</b> is created from the master template, shared with your OS team. Files you generate are owned by you within it.
              </span>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between mt-5">
        <Btn variant="ghost" onClick={step === 0 ? () => navigate("/") : () => setStep(step - 1)} icon={step === 0 ? undefined : "chevL"}>
          {step === 0 ? "Cancel" : "Back"}
        </Btn>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-faint">
            Step {step + 1} / {STEPS.length}
          </span>
          <Btn onClick={step === STEPS.length - 1 ? finish : () => setStep(step + 1)} disabled={!canNext} icon={step === STEPS.length - 1 ? "check" : "chevR"}>
            {step === STEPS.length - 1 ? "Create event" : "Continue"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
