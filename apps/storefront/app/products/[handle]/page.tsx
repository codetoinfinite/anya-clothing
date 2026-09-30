import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductByHandle, listProducts, productImage, productPrice } from "@/lib/data";
import { ProductMain } from "@/components/product/ProductMain";
import { ProductSlider } from "@/components/home/ProductSlider";
import { Reviews } from "@/components/product/Reviews";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";

export const revalidate = 300;

type Params = { handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const p = await getProductByHandle(handle);
  if (!p) return { title: "Product not found" };
  return {
    title: p.title,
    description: p.description?.slice(0, 160) ?? `Shop ${p.title}.`,
    openGraph: {
      title: p.title,
      images: productImage(p) ? [productImage(p)!] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const related = product.collection_id
    ? (await listProducts({ collection_id: product.collection_id, limit: 8 })).products.filter((p) => p.id !== product.id)
    : [];

  const images = (product.images?.map((i) => i.url).filter(Boolean) as string[]) ?? [];
  if (!images.length && product.thumbnail) images.push(product.thumbnail);

  const price = productPrice(product);
  const url = `${env.siteUrl}/products/${product.handle}`;
  const inStock = product.variants?.some((v) => (v.inventory_quantity ?? 1) > 0) ?? true;
  const breadcrumb = [
    { name: "Home", url: env.siteUrl },
    ...(product.collection?.handle
      ? [{ name: product.collection.title, url: `${env.siteUrl}/collections/${product.collection.handle}` }]
      : []),
    { name: product.title, url },
  ];

  return (
    <div className="container-wide py-8 md:py-12">
      <ProductJsonLd
        name={product.title}
        description={product.description}
        image={images}
        sku={product.variants?.[0]?.sku}
        url={url}
        price={price ? price.amount : undefined}
        currency={price?.currency}
        availability={inStock ? "InStock" : "OutOfStock"}
      />
      <BreadcrumbJsonLd items={breadcrumb} />
      <nav className="text-xs text-[var(--color-ink-muted)] mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        {product.collection?.handle && (
          <>
            {" · "}
            <Link href={`/collections/${product.collection.handle}`} className="hover:underline">
              {product.collection.title}
            </Link>
          </>
        )}
        {" · "}
        <span>{product.title}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <ProductMain product={product} images={images} />
      </div>
      <Reviews />
      {related.length > 0 && (
        <ProductSlider eyebrow="You may also like" title="More from this collection" products={related} />
      )}
    </div>
  );
}
