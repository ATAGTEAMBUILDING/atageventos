export function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtRange(a: string, b: string): string {
  if (a === b) return fmtDate(a);
  const start = new Date(a + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  return `${start} – ${fmtDate(b)}`;
}

export function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
