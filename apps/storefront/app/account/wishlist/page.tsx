import Link from "next/link";
import { getWishlistIds } from "@/lib/wishlist";
import { listProducts } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const ids = await getWishlistIds();
  const all = ids.length ? (await listProducts({ limit: 100 })).products.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="container-wide py-12 md:py-16">
      <div className="eyebrow mb-2">Account · Wishlist</div>
      <h1 className="text-4xl md:text-5xl mb-8">Saved for later</h1>
      {all.length === 0 ? (
        <div className="border border-[var(--color-line)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          No saved pieces yet. Tap the heart on any product to save it. <Link href="/" className="link-underline">Browse</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {all.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
