import { listProducts } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { products } = q ? await listProducts({ q, limit: 48 }) : { products: [] };

  return (
    <div className="container-wide py-10 md:py-14">
      <div className="eyebrow mb-2">Search</div>
      <h1 className="text-3xl md:text-4xl">{q ? `Results for "${q}"` : "Search the store"}</h1>
      <form className="mt-6 max-w-xl">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search kurtas, dresses, co-ords…"
          className="w-full h-12 px-4 border border-[var(--color-line)] focus:border-[var(--color-ink)] outline-none"
        />
      </form>
      {q && (
        <div className="mt-10">
          {products.length === 0 ? (
            <div className="border border-[var(--color-line)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
              Nothing matches &quot;{q}&quot;. Try a broader term.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
