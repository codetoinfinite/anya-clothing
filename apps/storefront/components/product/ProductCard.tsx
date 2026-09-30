import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { productImage, productPrice } from "@/lib/data";
import { formatMoney } from "@/lib/medusa";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const img1 = productImage(product, 0);
  const img2 = productImage(product, 1) ?? img1;
  const price = productPrice(product);
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block"
      aria-label={product.title}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-bg-alt)]">
        {img1 ? (
          <>
            <Image
              src={img1}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              priority={priority}
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            {img2 && (
              <Image
                src={img2}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.03]"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--color-ink-soft)] text-sm">
            no image
          </div>
        )}
        {product.collection?.title?.toLowerCase().includes("sale") && (
          <span className="absolute left-3 top-3 bg-[var(--color-sale)] text-white text-[11px] tracking-[0.14em] uppercase px-2 py-1">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium leading-tight">{product.title}</div>
          {product.collection?.title && (
            <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">{product.collection.title}</div>
          )}
        </div>
        {price && (
          <div className="text-sm whitespace-nowrap">{formatMoney(price.amount, price.currency)}</div>
        )}
      </div>
    </Link>
  );
}
