export type Search = Record<string, string | string[] | undefined>;

export function parseInt32(v: string | string[] | undefined, fallback: number): number {
  if (v == null) return fallback;
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseStr(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  return s.length > 0 ? s : undefined;
}

export function buildQuery(base: Record<string, any>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v == null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
