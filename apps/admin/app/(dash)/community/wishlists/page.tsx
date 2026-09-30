import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination } from "@/components/DataTable";
import { parseInt32 } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

type Item = {
  id: string;
  customer_id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
};

export default async function WishlistsPage({ searchParams }: { searchParams: Promise<{ limit?: string; offset?: string }> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 50);
  const offset = parseInt32(sp.offset, 0);
  const data = await adminFetch<{ items: Item[]; count: number }>(`/admin/wishlist?limit=${limit}&offset=${offset}`);

  const byProduct = new Map<string, number>();
  for (const it of data.items) byProduct.set(it.product_id, (byProduct.get(it.product_id) ?? 0) + 1);
  const top = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Wishlists" subtitle="Read-only. Most-wishlisted products and full item log." />
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Most wishlisted</h2>
        {top.length === 0 ? <div className="text-sm text-[var(--color-ink-muted)]">No data yet.</div> : (
          <table className="w-full text-sm"><thead><tr><th className="text-left py-1">Product ID</th><th className="text-right py-1">Count</th></tr></thead>
            <tbody>{top.map(([pid, n]) => <tr key={pid} className="border-t border-[var(--color-border)]"><td className="font-mono py-1">{pid}</td><td className="text-right py-1">{n}</td></tr>)}</tbody>
          </table>
        )}
      </div>
      <DataTable
        rows={data.items}
        columns={[
          { key: "customer_id", header: "Customer", cell: (r) => <span className="font-mono text-xs">{r.customer_id}</span> },
          { key: "product_id", header: "Product", cell: (r) => <span className="font-mono text-xs">{r.product_id}</span> },
          { key: "variant_id", header: "Variant", cell: (r) => <span className="font-mono text-xs">{r.variant_id ?? "—"}</span> },
          { key: "created_at", header: "Added", width: "180px", cell: (r) => formatDate(r.created_at) },
        ]}
      />
      <Pagination basePath="/community/wishlists" query={{}} limit={limit} offset={offset} total={data.count} />
    </div>
  );
}
