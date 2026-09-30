import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "./env";

export async function getToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(env.COOKIE_NAME)?.value ?? null;
}

export async function requireToken(): Promise<string> {
  const t = await getToken();
  if (!t) redirect("/login");
  return t;
}

export async function setToken(token: string): Promise<void> {
  const c = await cookies();
  c.set(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.IS_PROD,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN,
    path: "/admin",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearToken(): Promise<void> {
  const c = await cookies();
  c.delete({ name: env.COOKIE_NAME, path: "/admin" });
}

export async function signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${env.MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body?.message ?? "Invalid email or password" };
  }
  const { token } = await res.json();
  if (!token) return { ok: false, error: "No token returned" };
  await setToken(token);
  return { ok: true };
}
