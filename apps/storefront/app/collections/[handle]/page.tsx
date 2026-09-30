import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { collectionImage, getCollectionByHandle, listProducts } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/collection/FilterSidebar";
import { SortDropdown } from "@/components/collection/SortDropdown";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";

export const revalidate = 300;

const PAGE_SIZE = 24;

type Params = { handle: string };
type Search = { page?: string; sort?: string; size?: string; color?: string; instock?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const c = await getCollectionByHandle(handle);
  return { title: c?.title ?? "Collection", description: `Shop ${c?.title ?? "collection"}.` };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { handle } = await params;
  const sp = await searchParams;
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();

  const page = Math.max(1, Number(sp.page ?? "1"));
  const offset = (page - 1) * PAGE_SIZE;
  const order = sp.sort && sp.sort !== "price" && sp.sort !== "-price" ? sp.sort : undefined;

  const { products, count } = collection.id ? await listProducts({
    collection_id: collection.id,
    limit: PAGE_SIZE,
    offset,
    order,
  }) : { products: [], count: 0 };

  let filtered = products;
  const sizes = sp.size?.split(",").filter(Boolean) ?? [];
  const colors = sp.color?.split(",").filter(Boolean) ?? [];
  if (sizes.length || colors.length) {
    filtered = filtered.filter((p) =>
      p.variants?.some((v) => {
        const vals = v.options?.map((o) => o.value.toLowerCase()) ?? [];
        const sizeOk = !sizes.length || sizes.some((s) => vals.includes(s.toLowerCase()));
        const colorOk = !colors.length || colors.some((c) => vals.includes(c.toLowerCase()));
        return sizeOk && colorOk;
      })
    );
  }
  if (sp.instock === "1") {
    filtered = filtered.filter((p) => p.variants?.some((v) => (v.inventory_quantity ?? 1) > 0));
  }
  if (sp.sort === "price" || sp.sort === "-price") {
    const dir = sp.sort === "-price" ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      const ap = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0;
      const bp = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0;
      return (ap - bp) * dir;
    });
  }

  const banner = collectionImage(collection);
  const totalPages = Math.max(1, Math.ceil((count ?? filtered.length) / PAGE_SIZE));

  return (
    <div className="container-wide py-10 md:py-14">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: env.siteUrl },
          { name: collection.title, url: `${env.siteUrl}/collections/${collection.handle}` },
        ]}
      />
      <nav className="text-xs text-[var(--color-ink-muted)] mb-4">
        <Link href="/" className="hover:underline">Home</Link> · <span>{collection.title}</span>
      </nav>
      {banner ? (
        <header className="relative mb-8 md:mb-10 h-[260px] md:h-[360px] overflow-hidden">
          <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover object-[center_30%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-6 md:p-10 text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl">{collection.title}</h1>
            <p className="mt-3 text-sm opacity-90">
              Hand-finished pieces from our small-batch atelier. Cut from breathable cotton-blend, lined where
              needed, with thread-and-bead detailing at the placket and cuffs.
            </p>
          </div>
        </header>
      ) : (
        <header className="mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl">{collection.title}</h1>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)] max-w-2xl">
            Hand-finished pieces from our small-batch atelier. Cut from breathable cotton-blend, lined where
            needed, with thread-and-bead detailing at the placket and cuffs.
          </p>
        </header>
      )}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <span className="text-sm text-[var(--color-ink-muted)]">{count} pieces</span>
        <SortDropdown />
      </div>
      <div className="md:flex md:gap-8">
        <FilterSidebar basePath={`/collections/${handle}`} />
        <div className="flex-1">
          <div className="hidden md:flex items-center justify-between mb-6">
            <span className="text-sm text-[var(--color-ink-muted)]">{count} pieces</span>
            <SortDropdown />
          </div>
          {filtered.length === 0 ? (
            <div className="border border-[var(--color-line)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
              {sizes.length || colors.length || sp.instock ? "No products match these filters." : "New pieces are on their way. Check back soon."}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                const next = new URLSearchParams();
                Object.entries(sp).forEach(([k, v]) => v && next.set(k, String(v)));
                next.set("page", String(n));
                return (
                  <Link
                    key={n}
                    href={`/collections/${handle}?${next.toString()}`}
                    className={`h-9 w-9 grid place-items-center border text-sm ${n === page ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"}`}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
