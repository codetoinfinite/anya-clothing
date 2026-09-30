import "server-only";
import { adminFetch } from "./medusa-admin";

export type Role = "owner" | "editor" | "fulfillment" | "readonly";

const ROLES: Role[] = ["owner", "editor", "fulfillment", "readonly"];

const SECTION_READ: Record<string, Role[]> = {
  "/": ["owner", "editor", "fulfillment", "readonly"],
  "/catalog": ["owner", "editor", "readonly"],
  "/sales": ["owner", "fulfillment", "readonly"],
  "/customers": ["owner", "editor", "fulfillment", "readonly"],
  "/inventory": ["owner", "fulfillment", "readonly"],
  "/content": ["owner", "editor", "readonly"],
  "/community": ["owner", "editor", "readonly"],
  "/settings": ["owner", "readonly"],
  "/settings/activity": ["owner", "editor", "fulfillment", "readonly"],
  "/settings/users": ["owner"],
};

const SECTION_WRITE: Record<string, Role[]> = {
  "/catalog": ["owner", "editor"],
  "/sales": ["owner", "fulfillment"],
  "/customers": ["owner", "editor"],
  "/inventory": ["owner", "fulfillment"],
  "/content": ["owner", "editor"],
  "/community": ["owner", "editor"],
  "/settings": ["owner"],
};

function matchPrefix(table: Record<string, Role[]>, pathname: string): Role[] | null {
  let best: { len: number; roles: Role[] } | null = null;
  for (const [prefix, roles] of Object.entries(table)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!best || prefix.length > best.len) best = { len: prefix.length, roles };
    }
  }
  return best?.roles ?? null;
}

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as string[]).includes(v);
}

export async function getCurrentUser(): Promise<{ id: string; email: string; role: Role } | null> {
  try {
    const r = await adminFetch<{ user: { id: string; email: string; metadata?: any } }>("/admin/users/me");
    const meta = r.user?.metadata ?? {};
    const role: Role = isRole(meta.role) ? meta.role : "owner";
    return { id: r.user.id, email: r.user.email, role };
  } catch {
    return null;
  }
}

export function canRead(role: Role, pathname: string): boolean {
  const allowed = matchPrefix(SECTION_READ, pathname);
  if (!allowed) return true;
  return allowed.includes(role);
}

export function canWrite(role: Role, pathname: string): boolean {
  const allowed = matchPrefix(SECTION_WRITE, pathname);
  if (!allowed) return role !== "readonly";
  return allowed.includes(role);
}

export const ALL_ROLES = ROLES;
