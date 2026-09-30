import Link from "next/link";

export function LongFormSEO() {
  return (
    <section className="container-wide py-16 md:py-24 max-w-3xl text-[var(--color-ink-muted)] text-sm leading-relaxed">
      <h2 className="text-2xl md:text-3xl text-[var(--color-ink)] mb-6">
        Hand-crafted contemporary ethnic wear, made to last.
      </h2>
      <p>
        Each piece in our collection is hand-finished in small batches across our ateliers in Jaipur, Lucknow,
        and Kolkata. We work directly with karigars to keep traditional techniques — hand-block printing,
        chikankari, zardosi, jamdani — alive in clothes designed for the way you live now.
      </p>
      <p className="mt-4">
        Cotton-blends and silks for breathable everyday wear. Cuts that drape rather than constrain. Trims and
        finishings that survive a hundred washes. We price honestly, restock thoughtfully, and ship from a
        single fulfilment centre in India to over 60 countries.
      </p>
      <p className="mt-4">
        Browse our latest <Link href="/collections/new-arrivals" className="underline">new arrivals</Link>, explore
        the <Link href="/collections/festive" className="underline">festive edit</Link>, or read our{" "}
        <Link href="/blog" className="underline">journal</Link> for care guides and craft notes.
      </p>
    </section>
  );
}
