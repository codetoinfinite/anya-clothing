import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/DataTable";
import { formatDate, formatMoney } from "@/lib/utils";

type Item = { id: string; title: string; product_title?: string; quantity: number; unit_price: number; total: number };
type Order = {
  id: string;
  display_id: number;
  email: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  currency_code: string;
  created_at: string;
  items: Item[];
  shipping_address?: { first_name?: string; last_name?: string; address_1?: string; city?: string; postal_code?: string; country_code?: string; phone?: string };
};

async function cancelOrder(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  try { await adminFetch(`/admin/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({}) }); }
  catch (e: any) { redirect(`/sales/orders/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath(`/sales/orders/${id}`);
  redirect(`/sales/orders/${id}?ok=Canceled`);
}

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { order } = await adminFetch<{ order: Order }>(`/admin/orders/${id}`);
  const c = order.currency_code;
  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={`Order #${order.display_id}`}
        back={{ href: "/sales/orders", label: "Orders" }}
        subtitle={`Placed ${formatDate(order.created_at)} · ${order.email}`}
        actions={<>
          <Badge tone={order.status === "completed" ? "success" : order.status === "canceled" ? "danger" : "warn"}>{order.status}</Badge>
          <Badge tone={order.payment_status === "captured" ? "success" : "default"}>{order.payment_status}</Badge>
          <Badge tone={order.fulfillment_status === "fulfilled" ? "success" : "default"}>{order.fulfillment_status}</Badge>
        </>}
      />
      {sp.error ? <div className="text-sm text-[var(--color-danger)]">{sp.error}</div> : null}
      {sp.ok ? <div className="text-sm text-[var(--color-success)]">{sp.ok}</div> : null}

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Items</h2>
        <table className="table">
          <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <td><div className="font-medium">{i.product_title ?? i.title}</div><div className="text-xs text-[var(--color-ink-muted)]">{i.title}</div></td>
                <td>{i.quantity}</td>
                <td>{formatMoney(i.unit_price, c)}</td>
                <td>{formatMoney(i.total, c)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3} className="text-right">Subtotal</td><td>{formatMoney(order.subtotal, c)}</td></tr>
            <tr><td colSpan={3} className="text-right">Shipping</td><td>{formatMoney(order.shipping_total, c)}</td></tr>
            <tr><td colSpan={3} className="text-right">Tax</td><td>{formatMoney(order.tax_total, c)}</td></tr>
            <tr><td colSpan={3} className="text-right font-semibold">Total</td><td className="font-semibold">{formatMoney(order.total, c)}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Shipping address</h2>
          {order.shipping_address ? (
            <div className="text-sm space-y-1">
              <div>{order.shipping_address.first_name} {order.shipping_address.last_name}</div>
              <div>{order.shipping_address.address_1}</div>
              <div>{order.shipping_address.city}, {order.shipping_address.postal_code}</div>
              <div>{order.shipping_address.country_code?.toUpperCase()}</div>
              <div>{order.shipping_address.phone}</div>
            </div>
          ) : <div className="text-sm text-[var(--color-ink-muted)]">No shipping address.</div>}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Actions</h2>
          <p className="text-xs text-[var(--color-ink-muted)] mb-3">Payment capture/refund is sidelined until provider is wired. Cancel below is safe.</p>
          {order.status !== "canceled" ? (
            <form action={cancelOrder}>
              <input type="hidden" name="id" value={order.id} />
              <button className="btn btn-danger">Cancel order</button>
            </form>
          ) : <div className="text-sm text-[var(--color-ink-muted)]">Order is canceled.</div>}
        </div>
      </div>
    </div>
  );
}
