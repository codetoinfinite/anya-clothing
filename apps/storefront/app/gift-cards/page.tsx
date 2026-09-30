import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift cards",
  description: "Aanya digital gift cards — delivered by email, redeemable across the store.",
};

const DENOMINATIONS = [1500, 3000, 5000, 10000];

export default function GiftCardsPage() {
  return (
    <div className="container-narrow py-16 md:py-24">
      <nav className="text-xs text-[var(--color-ink-muted)] mb-4">
        <Link href="/" className="hover:underline">Home</Link> · <span>Gift cards</span>
      </nav>
      <div className="eyebrow mb-2">For the woman who picks her own</div>
      <h1 className="text-4xl md:text-6xl">Aanya gift cards.</h1>
      <p className="mt-6 text-lg text-[var(--color-ink-muted)] max-w-2xl">
        Digital gift cards are delivered by email within minutes of purchase. Valid for twelve months
        from the date of issue and redeemable on any piece in the store, including sale.
      </p>

      <section className="mt-16">
        <h2 className="text-2xl mb-6">Choose a value</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DENOMINATIONS.map((d) => (
            <div
              key={d}
              className="border border-[var(--color-line)] p-6 text-center hover:border-[var(--color-ink)] transition-colors"
            >
              <div className="text-3xl font-[var(--font-display)]">
                ₹{d.toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)]">Digital</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
          Online gift-card checkout is coming soon. In the meantime, to purchase, write to{" "}
          <a href="mailto:hello@aanya.studio" className="link-underline">hello@aanya.studio</a>{" "}
          with the recipient&apos;s name and email and we&apos;ll send a private payment link the same day.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl mb-3">The fine print</h2>
        <ul className="space-y-2 text-sm text-[var(--color-ink-muted)] list-disc pl-5">
          <li>Valid for twelve months from purchase.</li>
          <li>Redeemable in full or in parts across multiple orders.</li>
          <li>Non-refundable; cannot be exchanged for cash.</li>
          <li>Applies to sale items unless otherwise noted.</li>
        </ul>
      </section>
    </div>
  );
}
