import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { collectionImage, listCollections } from "@/lib/data";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Shop all collections",
  description: "Browse the full Aanya range — kurtas, dresses, ethnic sets, co-ords and more.",
};

export default async function CollectionsIndexPage() {
  const collections = await listCollections();

  return (
    <div className="container-wide py-12 md:py-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: env.siteUrl },
          { name: "Collections", url: `${env.siteUrl}/collections` },
        ]}
      />
      <nav className="text-xs text-[var(--color-ink-muted)] mb-4">
        <Link href="/" className="hover:underline">Home</Link> · <span>Collections</span>
      </nav>
      <header className="mb-10">
        <div className="eyebrow mb-2">Shop the edit</div>
        <h1 className="text-4xl md:text-5xl">All collections</h1>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)] max-w-2xl">
          Hand-finished pieces, sorted by silhouette and occasion. Choose a collection to start.
        </p>
      </header>
      {collections.length === 0 ? (
        <div className="border border-[var(--color-line)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          No collections published yet. Check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {collections.map((c) => {
            const img = collectionImage(c);
            return (
            <Link
              key={c.id}
              href={`/collections/${c.handle}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-bg-alt)] grid place-items-center transition-colors group-hover:bg-[var(--color-line)]">
                {img && (
                  <>
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-[700ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  </>
                )}
                <span
                  className={`relative text-2xl md:text-3xl font-[var(--font-display)] tracking-tight ${
                    img ? "self-end mb-6 text-white" : ""
                  }`}
                >
                  {c.title}
                </span>
              </div>
              <div className="mt-3 text-sm link-underline">Shop {c.title} →</div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
