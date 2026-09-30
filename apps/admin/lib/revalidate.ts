// Notifies the storefront to revalidate cached content after an admin mutation.
// STOREFRONT_URL is injected by the Vercel service binding (see vercel.json); set it by hand only for
// plain `pnpm dev` (e.g. http://localhost:3000). No-ops cleanly when it or REVALIDATE_SECRET is missing.

export async function notifyStorefront(opts: { tags?: string[]; paths?: string[] }): Promise<void> {
  const base = process.env.STOREFRONT_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;
  const tags = opts.tags ?? [];
  const paths = opts.paths ?? [];
  if (tags.length === 0 && paths.length === 0) return;
  try {
    await fetch(new URL("/api/revalidate", base), {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags, paths }),
      cache: "no-store",
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.warn("[notifyStorefront]", (e as Error).message);
  }
}
