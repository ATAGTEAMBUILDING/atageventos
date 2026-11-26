import { useState } from "react";
import { Icon } from "@/lib/icons";
import { useAuth, type Role } from "@/lib/auth";
import { googleLoginUrl } from "@/lib/api";

const ROLES: { role: Role; blurb: string }[] = [
  { role: "Admin", blurb: "Full access" },
  { role: "Producer", blurb: "Plan & run events" },
  { role: "Facilitator", blurb: "Score on the day" },
  { role: "Viewer", blurb: "Read-only (clients)" },
];

export function LoginPage() {
  const { oauth, devLogin, loading } = useAuth();
  const [busy, setBusy] = useState<Role | null>(null);
  const err = new URLSearchParams(window.location.search).get("error");

  const pick = async (role: Role) => {
    setBusy(role);
    try {
      await devLogin(role);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingLeft: "max(16px,env(safe-area-inset-left,0px))", paddingRight: "max(16px,env(safe-area-inset-right,0px))" }}>
      <div className="w-full max-w-sm fadeup">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: "var(--accent)" }}>
            <Icon name="bolt" className="w-5 h-5" stroke={2} />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-lg">EventOps<span className="text-teal"> OS</span></div>
            <div className="text-[10px] font-mono text-faint">ATAG · Malaysia</div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h1 className="text-lg font-bold text-center">Sign in</h1>
          <p className="text-sm text-center mt-1 text-muted">Use your ATAG Google Workspace account.</p>

          {err && (
            <div className="mt-4 rounded-lg p-2.5 text-xs flex items-center gap-2" style={{ background: "var(--crit-sft)", color: "var(--crit)" }}>
              <Icon name="alert" className="w-4 h-4 shrink-0" />
              {err === "domain" ? "That account isn't on the myatag.com domain." : "Sign-in failed — please try again."}
            </div>
          )}

          <a
            href={googleLoginUrl}
            className={`mt-5 w-full inline-flex items-center justify-center gap-2.5 rounded-lg py-2.5 text-sm font-semibold ${oauth ? "" : "pointer-events-none opacity-40"}`}
            style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-2)" }}
          >
            <GoogleG />
            Continue with Google
          </a>
          {!oauth && !loading && (
            <p className="mt-2 text-[11px] text-center text-faint">Google OAuth isn't configured yet — use developer sign-in below.</p>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-faint">Developer sign-in</span>
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ role, blurb }) => (
              <button
                key={role}
                onClick={() => pick(role)}
                disabled={busy !== null}
                className="rounded-lg p-3 text-left transition-colors hover:bg-surface2 disabled:opacity-50"
                style={{ border: "1px solid var(--border-2)" }}
              >
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {busy === role && <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent" style={{ animation: "spin .7s linear infinite" }} />}
                  {role}
                </div>
                <div className="text-[11px] mt-0.5 text-muted">{blurb}</div>
              </button>
            ))}
          </div>
        </div>
        <p className="text-center text-[11px] mt-4 text-faint">Signing in creates a user scoped to the myatag.com workspace.</p>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.8 37.9 46.5 31.8 46.5 24.5Z" />
      <path fill="#FBBC05" d="M10.3 28.4a14.5 14.5 0 0 1 0-8.8l-7.8-6.1a24 24 0 0 0 0 21l7.8-6.1Z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.4-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.4 0-11.8-3.8-13.7-9.4l-7.8 6.1C6.4 42.6 14.6 48 24 48Z" />
    </svg>
  );
}
