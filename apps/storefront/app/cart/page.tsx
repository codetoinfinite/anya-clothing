import Link from "next/link";
import { getCart } from "@/lib/cart";
import { CartLineRow } from "@/components/cart/CartLineRow";
import { formatMoney } from "@/lib/medusa";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const currency = cart?.currency_code ?? "inr";

  if (!items.length) {
    return (
      <div className="container-wide py-20 text-center">
        <div className="eyebrow mb-2">Bag</div>
        <h1 className="text-4xl md:text-5xl">Your bag is empty.</h1>
        <p className="mt-4 text-[var(--color-ink-muted)]">Discover something you&apos;ll love.</p>
        <Link href="/" className="btn btn-primary mt-8">Continue shopping</Link>
      </div>
    );
  }

  const FREE_THRESHOLD = 249900;
  const subtotal = cart?.subtotal ?? 0;
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);

  return (
    <div className="container-wide py-10 md:py-14">
      <h1 className="text-4xl md:text-5xl mb-2">Your bag</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-8">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <div>
          {remaining > 0 ? (
            <div className="border border-[var(--color-line)] p-4 mb-6">
              <div className="text-sm">
                You&apos;re <strong>{formatMoney(remaining, currency)}</strong> away from free shipping.
              </div>
              <div className="mt-2 h-1 bg-[var(--color-line)]">
                <div className="h-full bg-[var(--color-accent)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="border border-[var(--color-line)] p-4 mb-6 text-sm">
              ✓ You&apos;ve unlocked free shipping.
            </div>
          )}

          {items.map((it) => (
            <CartLineRow key={it.id} item={it} currency={currency} />
          ))}
        </div>

        <aside className="border border-[var(--color-line)] p-6 self-start">
          <h2 className="text-xl mb-4">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(cart?.subtotal ?? 0, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{cart?.shipping_total ? formatMoney(cart.shipping_total, currency) : "Calculated at checkout"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>{formatMoney(cart?.tax_total ?? 0, currency)}</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-[var(--color-line)] text-base font-medium">
              <dt>Total</dt>
              <dd>{formatMoney(cart?.total ?? 0, currency)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn btn-primary w-full mt-6 h-12">Checkout</Link>
          <Link href="/" className="block text-center text-xs tracking-[0.14em] uppercase mt-4 link-underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
