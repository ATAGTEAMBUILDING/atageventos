import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Icon, type IconName } from "@/lib/icons";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { OfflineBadge } from "@/components/OfflineBadge";
import { DRIVE_URL, PARENT_FOLDER } from "@/domain/seed";

function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const initials = user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-xs font-semibold truncate max-w-[140px]">{user.name}</span>
        <span className="text-[10px] font-semibold" style={{ color: "var(--accent)" }}>{user.role}</span>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "var(--accent-2)" }}>{initials}</div>
      <button onClick={logout} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface2 text-muted" aria-label="Sign out" title="Sign out">
        <Icon name="external" className="w-4 h-4" />
      </button>
    </div>
  );
}

const NAV: { label: string; icon: IconName; to: string }[] = [
  { label: "Dashboard", icon: "grid", to: "/" },
  { label: "Events", icon: "calendar", to: "/" },
  { label: "Crew", icon: "users", to: "/" },
  { label: "Drive Library", icon: "folder", to: "/" },
];

function Rail() {
  const { isDark, toggle } = useTheme();
  const loc = useLocation();
  return (
    <aside className="hidden md:flex flex-col shrink-0 w-[232px] border-r sticky top-0 h-screen" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "var(--accent)" }}>
          <Icon name="bolt" className="w-5 h-5" stroke={2} />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[15px]">
            EventOps<span className="text-teal"> OS</span>
          </div>
          <div className="text-[10px] font-mono text-faint">ATAG · Malaysia</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV.map((n, i) => (
          <Link
            key={i}
            to={n.to}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
            style={i === 0 && loc.pathname === "/" ? { background: "var(--accent-sft)", color: "var(--accent)" } : { color: "var(--muted)" }}
          >
            <Icon name={n.icon} className="w-[18px] h-[18px]" />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-3 border-t flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
        <a href={DRIVE_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg p-3 text-xs block hover:brightness-95" style={{ background: "var(--accent-sft)", color: "var(--accent-2)" }}>
          <div className="font-semibold flex items-center gap-1.5 mb-0.5">
            <Icon name="folder" className="w-3.5 h-3.5" />
            Master Google Drive
          </div>
          <div className="text-accent">{PARENT_FOLDER} · open ↗</div>
        </a>
        <button onClick={toggle} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted">
          <Icon name={isDark ? "sun" : "moon"} className="w-4 h-4" />
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { canManage } = useAuth();
  const onCreate = loc.pathname === "/events/new";
  return (
    <div className="flex min-h-screen">
      <Rail />
      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="sticky z-20 h-16 flex items-center justify-between border-b backdrop-blur"
          style={{ top: "env(safe-area-inset-top,0px)", borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 88%, transparent)", paddingLeft: "max(20px,env(safe-area-inset-left,0px))", paddingRight: "max(20px,env(safe-area-inset-right,0px))" }}
        >
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate("/")} className="font-semibold hover:underline" style={{ color: onCreate ? "var(--muted)" : "var(--text)" }}>
              Dashboard
            </button>
            {onCreate && (
              <>
                <Icon name="chevR" className="w-3.5 h-3.5" stroke={2} />
                <span className="font-semibold">New event</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <OfflineBadge />
            {!onCreate && canManage && (
              <button onClick={() => navigate("/events/new")} className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-white" style={{ background: "var(--accent)" }}>
                <Icon name="plus" className="w-3.5 h-3.5" />
                New event
              </button>
            )}
            <UserMenu />
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
