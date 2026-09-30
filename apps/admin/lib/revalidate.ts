// Notifies the storefront to revalidate cached content after an admin mutation.
// No-ops cleanly when STOREFRONT_REVALIDATE_URL / STOREFRONT_REVALIDATE_SECRET are not configured.

export async function notifyStorefront(opts: { tags?: string[]; paths?: string[] }): Promise<void> {
  const url = process.env.STOREFRONT_REVALIDATE_URL;
  const secret = process.env.STOREFRONT_REVALIDATE_SECRET;
  if (!url || !secret) return;
  const tags = opts.tags ?? [];
  const paths = opts.paths ?? [];
  if (tags.length === 0 && paths.length === 0) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags, paths }),
      cache: "no-store",
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.warn("[notifyStorefront]", (e as Error).message);
  }
}
