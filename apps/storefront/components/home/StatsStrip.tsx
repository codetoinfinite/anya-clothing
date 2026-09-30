const STATS = [
  { n: "2.5M+", l: "Customers worldwide" },
  { n: "120+", l: "Karigars employed" },
  { n: "60+", l: "Countries shipped to" },
  { n: "4.8/5", l: "Verified rating" },
];

export function StatsStrip() {
  return (
    <section className="bg-[var(--color-bg-alt)] border-y border-[var(--color-line)]">
      <div className="container-wide py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center">
        {STATS.map((s) => (
          <div key={s.l}>
            <div className="text-3xl md:text-4xl font-display">{s.n}</div>
            <div className="mt-2 text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)]">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
