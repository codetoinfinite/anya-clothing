import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press",
  description: "Press features, brand assets, and media contact for Aanya.",
};

const FEATURES = [
  { outlet: "Vogue India", date: "March 2026", title: "The new wave of slow-fashion ateliers" },
  { outlet: "Elle India", date: "January 2026", title: "Festive edit: heirloom kurtas, reimagined" },
  { outlet: "The Voice of Fashion", date: "October 2025", title: "Why Bagru block-print still matters" },
  { outlet: "Verve Magazine", date: "August 2025", title: "Aanya's quiet rise" },
];

export default function PressPage() {
  return (
    <div className="container-narrow py-16 md:py-24">
      <nav className="text-xs text-[var(--color-ink-muted)] mb-4">
        <Link href="/" className="hover:underline">Home</Link> · <span>Press</span>
      </nav>
      <div className="eyebrow mb-2">In the press</div>
      <h1 className="text-4xl md:text-6xl">Coverage & media kit.</h1>
      <p className="mt-6 text-lg text-[var(--color-ink-muted)] max-w-2xl">
        For interviews, samples, or imagery requests, write to{" "}
        <a href="mailto:press@aanya.studio" className="link-underline">press@aanya.studio</a>.
      </p>

      <section className="mt-16">
        <h2 className="text-2xl mb-6">Recent features</h2>
        <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {FEATURES.map((f) => (
            <li key={`${f.outlet}-${f.title}`} className="py-5">
              <div className="text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)]">
                {f.outlet} · {f.date}
              </div>
              <div className="mt-1 text-lg">{f.title}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl mb-3">Media kit</h2>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-xl">
          High-resolution imagery, brand marks, and an editor-ready bio are available on request.
          Please include your outlet and feature timing in your note.
        </p>
      </section>
    </div>
  );
}
