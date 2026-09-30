const REVIEWS = [
  { name: "Ananya R.", rating: 5, date: "Apr 18, 2026", body: "Fabric is gorgeous, fit is true to size. Wore it for a daytime event and got compliments all day." },
  { name: "Priya S.", rating: 4, date: "Apr 10, 2026", body: "Beautiful craftsmanship. Slightly snug on the bust, sizing up next time." },
  { name: "Meher K.", rating: 5, date: "Mar 30, 2026", body: "The block print is so vivid. Washed in cold water, no bleeding at all." },
];

export function Reviews() {
  const avg = REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length;
  return (
    <section className="container-wide py-16 md:py-24 border-t border-[var(--color-line)]">
      <div className="md:flex md:items-end md:justify-between mb-8">
        <div>
          <div className="eyebrow mb-2">Reviews</div>
          <h2 className="text-3xl md:text-4xl">What customers are saying</h2>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 text-sm">
          <span className="text-[var(--color-accent)] text-lg tracking-wide">{"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}</span>
          <span>{avg.toFixed(1)} · {REVIEWS.length} reviews</span>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {REVIEWS.map((r, i) => (
          <article key={i} className="border border-[var(--color-line)] p-6">
            <div className="text-[var(--color-accent)] text-sm tracking-wide">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p className="mt-3 text-sm">{r.body}</p>
            <div className="mt-4 text-xs text-[var(--color-ink-muted)]">
              <strong>{r.name}</strong> · {r.date} · Verified buyer
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
