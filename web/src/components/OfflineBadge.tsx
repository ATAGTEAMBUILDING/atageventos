import { useEffect, useState } from "react";
import { subscribeOffline, getOfflineState, type OfflineState } from "@/lib/offline";

export function useOffline(): OfflineState {
  const [s, setS] = useState<OfflineState>(getOfflineState());
  useEffect(() => subscribeOffline(setS), []);
  return s;
}

/** Shows only when offline or when writes are queued waiting to sync. */
export function OfflineBadge() {
  const { online, pending, syncing } = useOffline();
  if (online && pending === 0) return null;
  const offline = !online;
  const label = offline ? "Offline" : syncing ? `Syncing ${pending}…` : `${pending} queued`;
  const color = offline ? "var(--warn)" : "var(--info)";
  const bg = offline ? "var(--warn-sft)" : "var(--info-sft)";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ color, background: bg }} title={offline ? "You're offline — edits are saved on this device and will sync when you reconnect." : "Syncing queued edits to the server."}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
