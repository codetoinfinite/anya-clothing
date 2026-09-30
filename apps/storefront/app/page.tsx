import Link from "next/link";
import { listCollections, listProducts, getCollectionByHandle } from "@/lib/data";
import { getHomeSlots, type HomeSlot } from "@/lib/cms";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSlider } from "@/components/home/ProductSlider";
import { PromoBanner } from "@/components/home/PromoBanner";
import { StatsStrip } from "@/components/home/StatsStrip";
import { BlogPreview } from "@/components/home/BlogPreview";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { LongFormSEO } from "@/components/home/LongFormSEO";

export const revalidate = 60;

export default async function HomePage() {
  const slots = await getHomeSlots();
  if (slots.length === 0) return <StaticHome />;
  const ctx = { renderedFeatured: 0 };
  const rendered = await Promise.all(slots.map((s, i) => renderSlot(s, i, ctx)));
  const nonNull = rendered.filter(Boolean);
  if (nonNull.length === 0) return <StaticHome />;
  return (
    <>
      {nonNull}
      {ctx.renderedFeatured === 0 ? <FallbackProducts /> : null}
      <NewsletterCTA />
      <LongFormSEO />
    </>
  );
}

async function FallbackProducts() {
  const collections = await listCollections();
  const findId = (h: string) => collections.find((c) => c.handle === h)?.id;
  const newId = findId("new-arrivals") ?? findId("kurtas");
  const { products } = newId
    ? await listProducts({ collection_id: newId, limit: 12 })
    : await listProducts({ limit: 12 });
  if (!products.length) return null;
  return <ProductSlider eyebrow="Just in" title="New arrivals" products={products} viewAllHref="/collections/new-arrivals" />;
}

async function renderSlot(s: HomeSlot, key: number, ctx: { renderedFeatured: number }) {
  const p = s.payload ?? {};
  switch (s.slot) {
    case "hero": {
      const rawSlides = Array.isArray(p.slides) && p.slides.length
        ? p.slides
        : [{
            image: p.image,
            eyebrow: p.eyebrow ?? "",
            title: p.headline ?? "",
            copy: p.subhead ?? "",
            ctaLabel: p.cta_label ?? "Shop",
            ctaHref: p.cta_href ?? "/collections/all",
          }];
      const slides = rawSlides
        .filter((sl: any) => typeof sl?.image === "string" && sl.image.length > 0)
        .map((sl: any) => ({
          image: String(sl.image),
          eyebrow: String(sl.eyebrow ?? ""),
          title: String(sl.title ?? sl.headline ?? ""),
          copy: String(sl.copy ?? sl.subhead ?? ""),
          ctaLabel: String(sl.ctaLabel ?? sl.cta_label ?? "Shop"),
          ctaHref: String(sl.ctaHref ?? sl.cta_href ?? "/collections/all"),
        }));
      if (slides.length === 0) return null;
      return <HeroCarousel key={key} slides={slides} />;
    }
    case "category-grid": {
      const items = Array.isArray(p.categories)
        ? p.categories.filter((c: any) => c && typeof c.image === "string" && c.image.length > 0 && c.label && c.href)
        : undefined;
      if (items && items.length === 0) return null;
      return <CategoryGrid key={key} items={items} eyebrow={p.eyebrow} title={p.title} />;
    }
    case "featured-collection": {
      const handle = String(p.collection_handle ?? "");
      if (!handle) return null;
      const col = await getCollectionByHandle(handle);
      if (!col) return null;
      const { products } = await listProducts({ collection_id: col.id, limit: Number(p.limit ?? 12) });
      if (products.length === 0) return null;
      ctx.renderedFeatured += 1;
      return (
        <ProductSlider
          key={key}
          eyebrow={p.eyebrow ?? "Featured"}
          title={p.title ?? col.title}
          products={products}
          viewAllHref={`/collections/${col.handle}`}
        />
      );
    }
    case "blog-preview":
      return <BlogPreview key={key} limit={Number(p.limit ?? 3)} title={p.title ?? "From the journal"} />;
    case "promo": {
      const text = String(p.text ?? "");
      if (!text) return null;
      const tone = p.tone === "accent" ? "var(--color-accent)" : "var(--color-ink)";
      const inner = (
        <div className="py-10 text-center" style={{ background: tone, color: "var(--color-bg)" }}>
          <p className="text-base md:text-lg tracking-[0.04em] container-wide">{text}</p>
        </div>
      );
      return p.href ? <Link key={key} href={String(p.href)}>{inner}</Link> : <div key={key}>{inner}</div>;
    }
    default:
      return null;
  }
}

async function StaticHome() {
  const collections = await listCollections();
  const findId = (h: string) => collections.find((c) => c.handle === h)?.id;
  const newArrivalsId = findId("new-arrivals") ?? findId("kurtas");
  const saleId = findId("sale");
  const bestId = findId("best-sellers") ?? findId("dresses");

  const [newArrivals, sale, bestSellers] = await Promise.all([
    newArrivalsId ? listProducts({ collection_id: newArrivalsId, limit: 12 }) : listProducts({ limit: 12 }),
    saleId ? listProducts({ collection_id: saleId, limit: 12 }) : { products: [], count: 0 },
    bestId ? listProducts({ collection_id: bestId, limit: 12 }) : { products: [], count: 0 },
  ]);

  return (
    <>
      <HeroCarousel />
      <CategoryGrid />
      <ProductSlider eyebrow="Just in" title="New arrivals" products={newArrivals.products} viewAllHref="/collections/new-arrivals" />
      <PromoBanner />
      <ProductSlider eyebrow="Most-loved" title="Best sellers" products={bestSellers.products} viewAllHref="/collections/best-sellers" />
      <StatsStrip />
      {sale.products.length > 0 && (
        <ProductSlider eyebrow="End of season" title="Sale" products={sale.products} viewAllHref="/collections/sale" />
      )}
      <BlogPreview />
      <NewsletterCTA />
      <LongFormSEO />
    </>
  );
}
