import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Post = { id: string; slug: string; title: string; status: string; tag?: string | null; author?: string | null; published_at?: string | null; created_at: string };

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const status = parseStr(sp.status);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const data = await adminFetch<{ posts: Post[]; count: number }>(`/admin/blog?${params}`);
  return (
    <div>
      <PageHeader title="Blog" actions={<Link href="/content/blog/new" className="btn btn-primary">New post</Link>} />
      <form className="card p-3 mb-4 flex gap-2">
        <input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search title/slug" />
        <select name="status" defaultValue={status ?? ""} className="input w-32">
          <option value="">All</option><option value="draft">Draft</option><option value="published">Published</option>
        </select>
        <button className="btn btn-outline">Filter</button>
      </form>
      <DataTable
        rows={data.posts}
        rowHref={(r) => `/content/blog/${r.id}`}
        columns={[
          { key: "title", header: "Title", cell: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-[var(--color-ink-muted)]">/{r.slug}</div></div> },
          { key: "status", header: "Status", cell: (r) => <Badge tone={r.status === "published" ? "success" : "warn"}>{r.status}</Badge>, width: "120px" },
          { key: "tag", header: "Tag", cell: (r) => r.tag ?? "—", width: "120px" },
          { key: "published_at", header: "Published", cell: (r) => formatDate(r.published_at), width: "180px" },
        ]}
      />
      <Pagination basePath="/content/blog" query={{ q, status }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
