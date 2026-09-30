"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback } from "react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductSlider({
  eyebrow,
  title,
  products,
  viewAllHref,
}: {
  eyebrow?: string;
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const [ref, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: true });
  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  if (!products.length) return null;

  return (
    <section className="container-wide py-16 md:py-24">
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div>
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h2 className="text-3xl md:text-4xl">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {viewAllHref && (
            <Link href={viewAllHref} className="hidden md:inline link-underline text-sm">View all</Link>
          )}
          <div className="flex gap-2">
            <button aria-label="Previous" onClick={scrollPrev} className="h-9 w-9 border border-[var(--color-line)] grid place-items-center hover:bg-[var(--color-bg-alt)]">
              ‹
            </button>
            <button aria-label="Next" onClick={scrollNext} className="h-9 w-9 border border-[var(--color-line)] grid place-items-center hover:bg-[var(--color-bg-alt)]">
              ›
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="overflow-hidden">
        <div className="flex gap-4 md:gap-6">
          {products.map((p) => (
            <div key={p.id} className="min-w-0 flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_24%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
