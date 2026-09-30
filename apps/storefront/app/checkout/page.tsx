import { redirect } from "next/navigation";
import { getCart, listShippingOptions } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { formatMoney } from "@/lib/medusa";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart || !cart.items?.length) redirect("/cart");
  const opts = await listShippingOptions();
  const currency = cart.currency_code ?? "inr";

  return (
    <div className="container-wide py-10 md:py-14">
      <h1 className="text-4xl md:text-5xl mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <CheckoutForm
          shippingOptions={opts.map((o) => ({ id: o.id, name: o.name, amount: o.amount ?? 0 }))}
          currency={currency}
        />
        <aside className="border border-[var(--color-line)] p-6 self-start">
          <h2 className="text-xl mb-4">Summary</h2>
          <div className="space-y-3 text-sm">
            {cart.items.map((i) => (
              <div key={i.id} className="flex justify-between gap-3">
                <span className="flex-1">
                  {i.product_title} <span className="text-[var(--color-ink-muted)]">× {i.quantity}</span>
                  <div className="text-xs text-[var(--color-ink-muted)]">{i.variant_title}</div>
                </span>
                <span>{formatMoney((i.unit_price ?? 0) * i.quantity, currency)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 pt-4 border-t border-[var(--color-line)] space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(cart.subtotal ?? 0, currency)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{formatMoney(cart.shipping_total ?? 0, currency)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{formatMoney(cart.tax_total ?? 0, currency)}</dd></div>
            <div className="flex justify-between pt-3 border-t border-[var(--color-line)] text-base font-medium">
              <dt>Total</dt><dd>{formatMoney(cart.total ?? 0, currency)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
