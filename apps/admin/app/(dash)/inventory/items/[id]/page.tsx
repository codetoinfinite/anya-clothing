import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";

type Level = { id: string; location_id: string; stocked_quantity: number; reserved_quantity: number; incoming_quantity: number };
type Item = { id: string; sku: string | null; title?: string | null; location_levels?: Level[] };

export default async function InventoryItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { inventory_item } = await adminFetch<{ inventory_item: Item }>(`/admin/inventory-items/${id}?fields=*location_levels`);
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={inventory_item.sku ?? inventory_item.id} back={{ href: "/inventory/items", label: "Inventory" }} subtitle={inventory_item.title ?? ""} />
      <div className="card p-6">
        <h2 className="font-semibold mb-3">Stock by location</h2>
        {inventory_item.location_levels?.length ? (
          <table className="table">
            <thead><tr><th>Location</th><th>Stocked</th><th>Reserved</th><th>Incoming</th></tr></thead>
            <tbody>
              {inventory_item.location_levels.map((l) => (
                <tr key={l.id}><td>{l.location_id}</td><td>{l.stocked_quantity}</td><td>{l.reserved_quantity}</td><td>{l.incoming_quantity}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-sm text-[var(--color-ink-muted)]">No stock levels.</div>}
      </div>
    </div>
  );
}
