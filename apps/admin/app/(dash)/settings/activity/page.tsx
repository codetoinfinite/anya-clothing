import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";

type Entry = {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  method: string;
  path: string;
  status: number | null;
  ip: string | null;
  ua: string | null;
};

const RESOURCES = ["", "product", "order", "customer", "blog_post", "cms_page", "home_slot", "site_settings", "review", "contact_submission", "newsletter_subscriber", "promotion", "collection", "inventory_item"];

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ resource_type?: string; method?: string; offset?: string }> }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  params.set("limit", "100");
  if (sp.resource_type) params.set("resource_type", sp.resource_type);
  if (sp.method) params.set("method", sp.method);
  if (sp.offset) params.set("offset", sp.offset);

  const { entries, count, offset, limit } = await adminFetch<{ entries: Entry[]; count: number; offset: number; limit: number }>(`/admin/activity?${params.toString()}`);

  const prev = Math.max(0, offset - limit);
  const next = offset + limit < count ? offset + limit : null;
  const makeHref = (off: number) => {
    const u = new URLSearchParams(params);
    u.set("offset", String(off));
    return `/settings/activity?${u.toString()}`;
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Activity log" subtitle={`${count.toLocaleString()} admin mutations`} />
      <form className="card p-3 flex flex-wrap gap-3 items-end" action="/settings/activity">
        <label className="text-sm">
          <div className="text-xs text-[var(--color-muted)] mb-1">Resource</div>
          <select name="resource_type" defaultValue={sp.resource_type ?? ""} className="input">
            {RESOURCES.map((r) => <option key={r} value={r}>{r || "All"}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <div className="text-xs text-[var(--color-muted)] mb-1">Method</div>
          <select name="method" defaultValue={sp.method ?? ""} className="input">
            <option value="">All</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>
        <button className="btn btn-primary">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-2)] text-left">
            <tr>
              <th className="p-2">When</th>
              <th className="p-2">User</th>
              <th className="p-2">Action</th>
              <th className="p-2">Resource</th>
              <th className="p-2">Path</th>
              <th className="p-2">Status</th>
              <th className="p-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-[var(--color-muted)]">No activity yet.</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id} className="border-t border-[var(--color-border)] align-top">
                <td className="p-2 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                <td className="p-2">{e.user_email ?? e.user_id ?? "—"}</td>
                <td className="p-2 font-mono text-xs">{e.action}</td>
                <td className="p-2 font-mono text-xs">{e.resource_type}{e.resource_id ? `:${e.resource_id.slice(0, 12)}…` : ""}</td>
                <td className="p-2 font-mono text-xs">{e.method} {e.path}</td>
                <td className="p-2">{e.status ?? ""}</td>
                <td className="p-2 text-xs">{e.ip ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between text-sm">
        <div>{offset + 1}–{Math.min(offset + entries.length, count)} of {count}</div>
        <div className="flex gap-2">
          {offset > 0 ? <Link className="btn btn-outline" href={makeHref(prev)}>Prev</Link> : null}
          {next !== null ? <Link className="btn btn-outline" href={makeHref(next)}>Next</Link> : null}
        </div>
      </div>
    </div>
  );
}
