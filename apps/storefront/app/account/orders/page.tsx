import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer, listOrders } from "@/lib/auth";
import { formatMoney } from "@/lib/medusa";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const c = await getCustomer();
  if (!c) redirect("/login");
  const orders = await listOrders();

  return (
    <div className="container-wide py-12 md:py-16">
      <div className="eyebrow mb-2">Account · Orders</div>
      <h1 className="text-4xl md:text-5xl mb-8">Your orders</h1>
      {orders.length === 0 ? (
        <div className="border border-[var(--color-line)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          You haven&apos;t placed an order yet. <Link href="/" className="link-underline">Start shopping</Link>.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-[var(--color-line)] p-5 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <div className="text-sm font-medium">Order #{o.display_id ?? o.id.slice(-6)}</div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-1">
                  {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  {" · "}{o.items?.length ?? 0} items
                </div>
              </div>
              <div className="text-sm">{formatMoney(o.total ?? 0, o.currency_code ?? "inr")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
