import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination } from "@/components/DataTable";
import { parseInt32, parseStr } from "@/lib/search-params";

type Item = { id: string; sku: string | null; title?: string | null; description?: string | null };

export default async function InventoryItemsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  const data = await adminFetch<{ inventory_items: Item[]; count: number }>(`/admin/inventory-items?${params}`);
  return (
    <div>
      <PageHeader title="Inventory items" subtitle="SKU-level stock items." />
      <form className="card p-3 mb-4 flex gap-2"><input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Search SKU" /><button className="btn btn-outline">Filter</button></form>
      <DataTable
        rows={data.inventory_items}
        rowHref={(r) => `/inventory/items/${r.id}`}
        columns={[
          { key: "sku", header: "SKU", cell: (r) => <div className="font-medium">{r.sku ?? "—"}</div> },
          { key: "title", header: "Title", cell: (r) => r.title ?? "—" },
        ]}
      />
      <Pagination basePath="/inventory/items" query={{ q }} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
