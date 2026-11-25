import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tone = "accent" | "good" | "warn" | "crit" | "info" | "teal";
interface ToastItem {
  id: string;
  msg: string;
  tone: Tone;
}

const ToastCtx = createContext<(msg: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ToastItem[]>([]);
  const push = useCallback((msg: string, tone: Tone = "accent") => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l, { id, msg, tone }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-[min(92vw,400px)]">
        {list.map((t) => (
          <div
            key={t.id}
            className="fadeup rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2.5 shadow-lg bg-surface text-ink"
            style={{ border: "1px solid var(--border-2)" }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `var(--${t.tone})` }} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
