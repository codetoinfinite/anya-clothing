import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Aanya atelier — open roles, internships, and craft fellowships.",
};

const ROLES = [
  {
    title: "Senior Pattern Maker",
    location: "Jaipur, India",
    type: "Full-time",
    summary:
      "Lead the cutting room. Translate sketches into production patterns, grade across our size range, and mentor two junior makers.",
  },
  {
    title: "E-commerce Manager",
    location: "Remote (India)",
    type: "Full-time",
    summary:
      "Own the digital storefront end-to-end — merchandising, analytics, conversion, and customer journey.",
  },
  {
    title: "Block-print Apprentice",
    location: "Bagru, Rajasthan",
    type: "Fellowship · 12 months",
    summary:
      "A paid apprenticeship with our partner karkhana. Open to design graduates passionate about traditional textile crafts.",
  },
];

export default function CareersPage() {
  return (
    <div className="container-narrow py-16 md:py-24">
      <nav className="text-xs text-[var(--color-ink-muted)] mb-4">
        <Link href="/" className="hover:underline">Home</Link> · <span>Careers</span>
      </nav>
      <div className="eyebrow mb-2">Work with us</div>
      <h1 className="text-4xl md:text-6xl">Build the slow-fashion house.</h1>
      <p className="mt-6 text-lg text-[var(--color-ink-muted)] max-w-2xl">
        We hire makers, merchants, and quiet thinkers. Roles are small in number and long in tenure —
        most of our atelier has been with us for over five years.
      </p>

      <section className="mt-16">
        <h2 className="text-2xl mb-6">Open roles</h2>
        <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {ROLES.map((r) => (
            <li key={r.title} className="py-6 md:flex md:items-start md:justify-between gap-8">
              <div className="md:flex-1">
                <h3 className="text-xl">{r.title}</h3>
                <div className="mt-1 text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)]">
                  {r.location} · {r.type}
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)] max-w-xl">{r.summary}</p>
              </div>
              <a
                href={`mailto:careers@aanya.studio?subject=${encodeURIComponent(r.title)}`}
                className="mt-4 md:mt-0 inline-block btn btn-secondary"
              >
                Apply
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl mb-3">Don&apos;t see your role?</h2>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-xl">
          We&apos;re always meeting people we&apos;d like to work with. Send a note and a few words about what
          you&apos;d build here to{" "}
          <a href="mailto:careers@aanya.studio" className="link-underline">careers@aanya.studio</a>.
        </p>
      </section>
    </div>
  );
}
