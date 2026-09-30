import "server-only";
import { requireToken } from "./auth";
import { env } from "./env";

export class AdminFetchError extends Error {
  constructor(public status: number, public payload: any, message: string) { super(message); }
}

export async function adminFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await requireToken();
  const url = path.startsWith("http") ? path : `${env.MEDUSA_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await res.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    throw new AdminFetchError(res.status, json, `${init.method ?? "GET"} ${path} → ${res.status}`);
  }
  return json as T;
}

export async function adminGet<T>(path: string): Promise<T> {
  return adminFetch<T>(path);
}

export async function adminPost<T>(path: string, body?: any): Promise<T> {
  return adminFetch<T>(path, { method: "POST", body: body == null ? undefined : JSON.stringify(body) });
}

export async function adminDelete<T>(path: string): Promise<T> {
  return adminFetch<T>(path, { method: "DELETE" });
}
