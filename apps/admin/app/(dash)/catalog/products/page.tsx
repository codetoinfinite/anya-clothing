import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type AdminProduct = {
  id: string;
  title: string;
  handle: string;
  status: string;
  thumbnail?: string | null;
  created_at: string;
  variants?: Array<{ id: string }>;
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 20);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const status = parseStr(sp.status);
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (q) params.set("q", q);
  if (status) params.set("status[]", status);
  const data = await adminFetch<{ products: AdminProduct[]; count: number }>(`/admin/products?${params}`);

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Catalog of products and their variants."
        actions={<Link href="/catalog/products/new" className="btn btn-primary">New product</Link>}
      />
      <form className="card p-3 mb-4 flex items-center gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search title or handle" className="input flex-1" />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="proposed">Proposed</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="btn btn-outline">Filter</button>
      </form>
      <DataTable
        rows={data.products}
        rowHref={(r) => `/catalog/products/${r.id}`}
        columns={[
          { key: "title", header: "Title", cell: (r) => (
            <div className="flex items-center gap-3">
              {r.thumbnail ? <img src={r.thumbnail} alt="" className="w-8 h-8 object-cover rounded" /> : <div className="w-8 h-8 rounded bg-[var(--color-surface-alt)]" />}
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-[var(--color-ink-muted)]">/{r.handle}</div>
              </div>
            </div>
          ) },
          { key: "status", header: "Status", cell: (r) => <Badge tone={r.status === "published" ? "success" : r.status === "draft" ? "warn" : "default"}>{r.status}</Badge>, width: "140px" },
          { key: "variants", header: "Variants", cell: (r) => r.variants?.length ?? 0, width: "100px" },
          { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at), width: "180px" },
        ]}
      />
      <Pagination basePath="/catalog/products" query={{ q, status }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
