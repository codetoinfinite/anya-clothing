import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Aanya size guide — body measurements, fit notes, and how to measure.",
};

type Row = { size: string; bust: string; waist: string; hip: string };

const TOP_SIZES: Row[] = [
  { size: "XS", bust: "32 in / 81 cm", waist: "26 in / 66 cm", hip: "35 in / 89 cm" },
  { size: "S",  bust: "34 in / 86 cm", waist: "28 in / 71 cm", hip: "37 in / 94 cm" },
  { size: "M",  bust: "36 in / 91 cm", waist: "30 in / 76 cm", hip: "39 in / 99 cm" },
  { size: "L",  bust: "38 in / 97 cm", waist: "32 in / 81 cm", hip: "41 in / 104 cm" },
  { size: "XL", bust: "40 in / 102 cm", waist: "34 in / 86 cm", hip: "43 in / 109 cm" },
];

const BOTTOM_SIZES: Row[] = [
  { size: "XS", bust: "—", waist: "26 in / 66 cm", hip: "35 in / 89 cm" },
  { size: "S",  bust: "—", waist: "28 in / 71 cm", hip: "37 in / 94 cm" },
  { size: "M",  bust: "—", waist: "30 in / 76 cm", hip: "39 in / 99 cm" },
  { size: "L",  bust: "—", waist: "32 in / 81 cm", hip: "41 in / 104 cm" },
  { size: "XL", bust: "—", waist: "34 in / 86 cm", hip: "43 in / 109 cm" },
];

function SizeTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto border border-[var(--color-line)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-bg-alt)] text-left">
          <tr>
            <th className="px-4 py-3 font-normal tracking-[0.16em] uppercase text-xs">Size</th>
            <th className="px-4 py-3 font-normal tracking-[0.16em] uppercase text-xs">Bust</th>
            <th className="px-4 py-3 font-normal tracking-[0.16em] uppercase text-xs">Waist</th>
            <th className="px-4 py-3 font-normal tracking-[0.16em] uppercase text-xs">Hip</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.size} className="border-t border-[var(--color-line)]">
              <td className="px-4 py-3">{r.size}</td>
              <td className="px-4 py-3">{r.bust}</td>
              <td className="px-4 py-3">{r.waist}</td>
              <td className="px-4 py-3">{r.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <div className="container-narrow py-16 md:py-24">
      <nav className="text-xs text-[var(--color-ink-muted)] mb-4">
        <Link href="/" className="hover:underline">Home</Link> · <span>Size guide</span>
      </nav>
      <div className="eyebrow mb-2">Find your fit</div>
      <h1 className="text-4xl md:text-6xl">Size guide.</h1>
      <p className="mt-6 text-lg text-[var(--color-ink-muted)] max-w-2xl">
        Measurements are taken across the body, not the garment. Our silhouettes carry a relaxed ease;
        size down if you prefer a closer fit.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl mb-4">Tops, kurtas & dresses</h2>
        <SizeTable rows={TOP_SIZES} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl mb-4">Bottoms</h2>
        <SizeTable rows={BOTTOM_SIZES} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl mb-4">How to measure</h2>
        <ol className="space-y-3 text-sm text-[var(--color-ink-muted)] list-decimal pl-5">
          <li><span className="text-[var(--color-ink)] font-medium">Bust:</span> Measure across the fullest part, keeping the tape level.</li>
          <li><span className="text-[var(--color-ink)] font-medium">Waist:</span> The narrowest part of your torso, usually above the navel.</li>
          <li><span className="text-[var(--color-ink)] font-medium">Hip:</span> The fullest part, typically 8 inches below the natural waist.</li>
        </ol>
        <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
          Still unsure? Write to{" "}
          <a href="mailto:hello@aanya.studio" className="link-underline">hello@aanya.studio</a>{" "}
          with the piece you&apos;re considering and we&apos;ll recommend your size.
        </p>
      </section>
    </div>
  );
}
