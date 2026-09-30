"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch, AdminFetchError } from "./medusa-admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function safeMutate(fn: () => Promise<any>): Promise<ActionResult> {
  try {
    await fn();
    return { ok: true };
  } catch (e) {
    if (e instanceof AdminFetchError) {
      const msg = (e.payload && typeof e.payload === "object" && "message" in e.payload && typeof (e.payload as any).message === "string")
        ? (e.payload as any).message
        : e.message;
      return { ok: false, error: msg };
    }
    return { ok: false, error: (e as Error).message ?? "Unknown error" };
  }
}

export async function mutateAndRevalidate(
  fn: () => Promise<any>,
  paths: string[],
): Promise<ActionResult> {
  const r = await safeMutate(fn);
  if (r.ok) for (const p of paths) revalidatePath(p);
  return r;
}

export async function mutateAndRedirect(
  fn: () => Promise<any>,
  redirectTo: string,
  paths: string[] = [],
): Promise<ActionResult> {
  const r = await safeMutate(fn);
  if (!r.ok) return r;
  for (const p of paths) revalidatePath(p);
  redirect(redirectTo);
}

export { adminFetch, AdminFetchError };
