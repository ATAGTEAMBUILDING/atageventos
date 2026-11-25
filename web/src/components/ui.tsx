import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/lib/icons";
import type { EventStatus } from "@/domain/types";

export type Tone = "neutral" | "good" | "warn" | "crit" | "info" | "accent" | "teal" | "purple" | "gold";

const TONE: Record<Tone, [string, string]> = {
  neutral: ["var(--muted)", "var(--surface-2)"],
  good: ["var(--good)", "var(--good-sft)"],
  warn: ["var(--warn)", "var(--warn-sft)"],
  crit: ["var(--crit)", "var(--crit-sft)"],
  info: ["var(--info)", "var(--info-sft)"],
  accent: ["var(--accent)", "var(--accent-sft)"],
  teal: ["var(--teal)", "var(--teal-sft)"],
  purple: ["var(--purple)", "var(--purple-sft)"],
  gold: ["var(--gold)", "var(--gold-sft)"],
};

export function Pill({ tone = "neutral", children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  const [fg, bg] = TONE[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ color: fg, background: bg }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: fg }} />}
      {children}
    </span>
  );
}

const STATUS: Record<EventStatus, [string, string]> = {
  Draft: ["var(--faint)", "var(--surface-2)"],
  Planning: ["var(--info)", "var(--info-sft)"],
  Ready: ["var(--good)", "var(--good-sft)"],
  Live: ["var(--teal)", "var(--teal-sft)"],
  Complete: ["var(--muted)", "var(--surface-2)"],
};

export function StatusPill({ s }: { s: EventStatus }) {
  const [fg, bg] = STATUS[s];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ color: fg, background: bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: fg }} />
      {s}
    </span>
  );
}

type Variant = "primary" | "teal" | "good" | "secondary" | "outlineInfo" | "outlineGood" | "ghost";
type Size = "sm" | "md" | "lg";

const VAR: Record<Variant, { className: string; style: CSSProperties }> = {
  primary: { className: "text-white hover:brightness-110", style: { background: "var(--accent)" } },
  teal: { className: "text-white hover:brightness-110", style: { background: "var(--teal)" } },
  good: { className: "text-white hover:brightness-110", style: { background: "var(--good)" } },
  secondary: { className: "hover:bg-surface2", style: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-2)" } },
  outlineInfo: { className: "hover:bg-infoSoft", style: { background: "var(--surface)", color: "var(--info)", border: "1px solid var(--info)" } },
  outlineGood: { className: "hover:bg-goodSoft", style: { background: "var(--surface)", color: "var(--good)", border: "1px solid var(--good)" } },
  ghost: { className: "hover:bg-surface2", style: { color: "var(--muted)" } },
};
const SIZE: Record<Size, string> = { sm: "text-xs px-2.5 py-1.5", md: "text-sm px-3.5 py-2", lg: "text-sm px-4 py-2.5" };

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
}
export function Btn({ variant = "primary", size = "md", icon, children, className, ...p }: BtnProps) {
  const v = VAR[variant];
  return (
    <button
      {...p}
      className={cn("inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", SIZE[size], v.className, className)}
      style={v.style}
    >
      {icon && <Icon name={icon} className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      {children}
    </button>
  );
}

export function LinkBtn({ variant = "secondary", size = "md", icon, children, href, className }: { variant?: Variant; size?: Size; icon?: IconName; children: ReactNode; href: string; className?: string }) {
  const v = VAR[variant];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors", SIZE[size], v.className, className)}
      style={v.style}
    >
      {icon && <Icon name={icon} className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      {children}
    </a>
  );
}

export function Card({ className, children, pad = true, style }: { className?: string; children: ReactNode; pad?: boolean; style?: CSSProperties }) {
  return (
    <div className={cn("rounded-xl shadow-card", pad && "p-5", className)} style={{ background: "var(--surface)", border: "1px solid var(--border)", ...style }}>
      {children}
    </div>
  );
}

export function Panel({ className, children, pad = true, style }: { className?: string; children: ReactNode; pad?: boolean; style?: CSSProperties }) {
  return (
    <div className={cn("rounded-xl", pad && "p-5", className)} style={{ background: "var(--surface)", border: "1px solid var(--border)", ...style }}>
      {children}
    </div>
  );
}

export const inputStyle: CSSProperties = { background: "var(--surface)", border: "1px solid var(--border-2)", color: "var(--text)" };

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function Ring({ value, size = 52, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 90 ? "var(--good)" : value >= 55 ? "var(--teal)" : value >= 30 ? "var(--warn)" : "var(--crit)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .5s ease" }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="font-mono tnum" style={{ fontSize: size * 0.26, fontWeight: 600, fill: "var(--text)" }}>
        {value}
      </text>
    </svg>
  );
}

export function Bar({ value, tone = "var(--teal)" }: { value: number; tone?: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: tone, transition: "width .4s ease" }} />
    </div>
  );
}

export function SectionHead({ title, desc, right }: { title: string; desc?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {desc && <p className="text-sm mt-0.5 text-muted">{desc}</p>}
      </div>
      {right}
    </div>
  );
}
