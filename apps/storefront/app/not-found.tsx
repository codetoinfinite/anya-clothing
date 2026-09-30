import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-wide py-32 text-center">
      <div className="eyebrow mb-4">404</div>
      <h1 className="text-5xl md:text-6xl mb-4">This page has wandered off.</h1>
      <p className="text-[var(--color-ink-muted)] mb-8">The link may have changed, or the piece may have sold out.</p>
      <Link href="/" className="btn btn-primary">Return home</Link>
    </section>
  );
}
