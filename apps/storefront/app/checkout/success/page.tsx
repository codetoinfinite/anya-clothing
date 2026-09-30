import Link from "next/link";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <div className="container-wide py-24 text-center max-w-xl mx-auto">
      <div className="eyebrow mb-3">Order confirmed</div>
      <h1 className="text-4xl md:text-5xl">Thank you.</h1>
      <p className="mt-4 text-[var(--color-ink-muted)]">
        Your order is being prepared with care. A confirmation email is on the way.
      </p>
      {order && (
        <p className="mt-2 text-xs text-[var(--color-ink-soft)] tracking-[0.14em] uppercase">
          Order ref · {order}
        </p>
      )}
      <div className="mt-10 flex gap-3 justify-center">
        <Link href="/account/orders" className="btn btn-primary">View orders</Link>
        <Link href="/" className="btn btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
