/**
 * Offline write queue (ADR-002). When a mutation can't reach the server, it's
 * stored in IndexedDB and replayed, in order, on reconnect. Reads are cached by
 * the service worker; this handles writes. A subscribable store exposes the
 * online flag + pending count so the UI can show it.
 */

export interface QueuedRequest {
  id?: number;
  method: string;
  path: string;
  body: unknown;
  at: number;
}

const DB_NAME = "eventops-offline";
const STORE = "outbox";
let apiBase = "";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function reqToPromise<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  try {
    return await reqToPromise(fn(db.transaction(STORE, mode).objectStore(STORE)));
  } finally {
    db.close();
  }
}

// --- state store -------------------------------------------------------------
export interface OfflineState {
  online: boolean;
  pending: number;
  syncing: boolean;
}
let state: OfflineState = { online: typeof navigator !== "undefined" ? navigator.onLine : true, pending: 0, syncing: false };
const listeners = new Set<(s: OfflineState) => void>();
function set(patch: Partial<OfflineState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}
export function getOfflineState() {
  return state;
}
export function subscribeOffline(fn: (s: OfflineState) => void) {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}

async function refreshCount() {
  try {
    set({ pending: await withStore("readonly", (s) => s.count()) });
  } catch {
    /* ignore */
  }
}

// --- queue ops ---------------------------------------------------------------
export async function enqueueRequest(method: string, path: string, body: unknown) {
  try {
    await withStore("readwrite", (s) => s.add({ method, path, body, at: Date.now() } as QueuedRequest));
  } catch {
    /* IndexedDB unavailable — nothing we can do but drop (rare: private mode) */
  }
  await refreshCount();
}

/** Replay queued writes in order. Stops at the first failure (still offline). */
export async function flushOutbox(): Promise<void> {
  if (state.syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  set({ syncing: true });
  try {
    const items = (await withStore<QueuedRequest[]>("readonly", (s) => s.getAll())).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    for (const item of items) {
      try {
        const res = await fetch(`${apiBase}${item.path}`, {
          method: item.method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.body),
        });
        // 2xx or a definitive client error (4xx, e.g. 403/409) — drop either way;
        // only a network failure (throw) should keep it queued for retry.
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          if (item.id != null) await withStore("readwrite", (s) => s.delete(item.id!));
        } else {
          break; // 5xx: stop, retry later
        }
      } catch {
        break; // offline again
      }
    }
  } finally {
    await refreshCount();
    set({ syncing: false });
  }
}

/** Wire up online/offline listeners + initial flush. Call once at startup. */
export function initOfflineSync(baseUrl: string) {
  apiBase = baseUrl;
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => {
    set({ online: true });
    void flushOutbox();
  });
  window.addEventListener("offline", () => set({ online: false }));
  void refreshCount();
  if (navigator.onLine) void flushOutbox();
}
