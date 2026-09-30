import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Coll = { id: string; title: string; handle: string; created_at: string };

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 20);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  const data = await adminFetch<{ collections: Coll[]; count: number }>(`/admin/collections?${params}`);
  return (
    <div>
      <PageHeader title="Collections" actions={<Link href="/catalog/collections/new" className="btn btn-primary">New collection</Link>} />
      <form className="card p-3 mb-4 flex gap-2"><input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search" /><button className="btn btn-outline">Filter</button></form>
      <DataTable
        rows={data.collections}
        rowHref={(r) => `/catalog/collections/${r.id}`}
        columns={[
          { key: "title", header: "Title", cell: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-[var(--color-ink-muted)]">/{r.handle}</div></div> },
          { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at), width: "200px" },
        ]}
      />
      <Pagination basePath="/catalog/collections" query={{ q }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
