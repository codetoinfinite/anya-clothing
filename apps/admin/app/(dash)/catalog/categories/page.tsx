import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination, Badge } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";

type Cat = { id: string; name: string; handle: string; is_active: boolean; is_internal: boolean };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 50);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  const data = await adminFetch<{ product_categories: Cat[]; count: number }>(`/admin/product-categories?${params}`);
  return (
    <div>
      <PageHeader title="Categories" actions={<Link href="/catalog/categories/new" className="btn btn-primary">New category</Link>} />
      <form className="card p-3 mb-4 flex gap-2"><input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search" /><button className="btn btn-outline">Filter</button></form>
      <DataTable
        rows={data.product_categories}
        rowHref={(r) => `/catalog/categories/${r.id}`}
        columns={[
          { key: "name", header: "Name", cell: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-[var(--color-ink-muted)]">/{r.handle}</div></div> },
          { key: "active", header: "Active", cell: (r) => <Badge tone={r.is_active ? "success" : "default"}>{r.is_active ? "yes" : "no"}</Badge>, width: "100px" },
          { key: "internal", header: "Internal", cell: (r) => r.is_internal ? "yes" : "no", width: "100px" },
        ]}
      />
      <Pagination basePath="/catalog/categories" query={{ q }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
