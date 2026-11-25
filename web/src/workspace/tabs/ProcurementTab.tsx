import { useState } from "react";
import { Card, Pill, Bar, Btn, inputStyle, type Tone } from "@/components/ui";
import { Icon } from "@/lib/icons";
import { useToast } from "@/lib/toast";
import { PROCUREMENT_STATUSES, type EventWorkspaceData, type ProcurementItem, type ProcurementStatus, type Urgency } from "@/domain/types";

const uTone: Record<Urgency, Tone> = { HIGH: "crit", MEDIUM: "warn", LOW: "neutral" };

export function ProcurementTab({ data }: { data: EventWorkspaceData }) {
  const toast = useToast();
  const alloc = data.budgetAllocUsd;
  const [rows, setRows] = useState<ProcurementItem[]>(data.procurement);
  const [filter, setFilter] = useState<"All" | ProcurementStatus>("All");

  const setStatus = (id: string, v: ProcurementStatus) => setRows((r) => r.map((x) => (x.id === id ? { ...x, status: v } : x)));
  const committed = rows.filter((r) => r.status !== "To Order").reduce((s, r) => s + r.cost, 0);
  const remaining = alloc - committed;
  const counts: Record<string, number> = {
    All: rows.length,
    "To Order": rows.filter((r) => r.status === "To Order").length,
    "Ordered (In Transit)": rows.filter((r) => r.status === "Ordered (In Transit)").length,
    "Received on Site": rows.filter((r) => r.status === "Received on Site").length,
  };
  const list = filter === "All" ? rows : rows.filter((r) => r.status === filter);
  const filters: ("All" | ProcurementStatus)[] = ["All", "To Order", "Ordered (In Transit)", "Received on Site"];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <Card className="flex-1 min-w-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Allocated Budget</span>
            <Icon name="cart" className="w-4 h-4 text-faint" />
          </div>
          <div className="mt-2 text-2xl font-bold tnum">
            ${alloc}
            <span className="text-sm font-medium ml-1 text-muted">USD</span>
          </div>
        </Card>
        <Card className="flex-1 min-w-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Committed Spend</span>
            <Icon name="cart" className="w-4 h-4 text-faint" />
          </div>
          <div className="mt-2 text-2xl font-bold tnum">
            ${committed}
            <span className="text-sm font-medium ml-1 text-muted">({Math.round((committed / alloc) * 100)}%)</span>
          </div>
          <div className="mt-2">
            <Bar value={(committed / alloc) * 100} tone={committed > alloc ? "var(--crit)" : "var(--good)"} />
          </div>
        </Card>
        <Card className="flex-1 min-w-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Remaining Cushion</span>
            <Icon name="bolt" className="w-4 h-4 text-faint" />
          </div>
          <div className="mt-2 text-2xl font-bold tnum" style={{ color: remaining < 0 ? "var(--crit)" : "var(--good)" }}>
            ${remaining}
            <span className="text-sm font-medium ml-1 text-muted">USD</span>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg p-0.5 overflow-x-auto" style={{ background: "var(--surface-2)" }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors" style={filter === f ? { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow)" } : { color: "var(--muted)" }}>
              {f === "All" ? `All Items (${counts.All})` : `${f.replace(" (In Transit)", "").replace(" on Site", "")} (${counts[f]})`}
            </button>
          ))}
        </div>
        <Btn variant="primary" icon="plus" onClick={() => toast("Add purchase order (stub)", "accent")}>
          Add Purchase Order
        </Btn>
      </div>

      <Card pad={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {["Item & Category", "Vendor / Supplier", "Urgency", "Est. Cost", "Fulfilment Status"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted ${h === "Est. Cost" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.item}</div>
                    <div className="text-xs mt-0.5 text-faint">
                      {r.category} · Qty {r.qty}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.vendor}</td>
                  <td className="px-4 py-3">
                    <Pill tone={uTone[r.urgency]}>{r.urgency}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tnum">${r.cost}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as ProcurementStatus)} className="rounded-lg px-3 py-2 text-sm min-w-[160px]" style={inputStyle}>
                      {PROCUREMENT_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                    No items in this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
