"use client";

import { useState } from "react";
import type { Product } from "@/lib/data";
import { ProductGallery } from "./ProductGallery";
import { ProductDetails } from "./ProductDetails";

/** Per-option-value gallery, e.g. { Ivory: [...urls], Indigo: [...] }, set by the catalog refresh script. */
export function variantImages(product: Product): Record<string, string[]> {
  const m = product.metadata?.variant_images;
  return m && typeof m === "object" ? (m as Record<string, string[]>) : {};
}

/** The option whose values have their own photos (Color, Finish…). */
function imageOptionTitle(product: Product): string | undefined {
  const keys = Object.keys(variantImages(product));
  return product.options?.find((o) => o.values.some((v) => keys.includes(v.value)))?.title;
}

export function ProductMain({ product, images }: { product: Product; images: string[] }) {
  const byValue = variantImages(product);
  const optionTitle = imageOptionTitle(product);
  const [value, setValue] = useState<string | undefined>(() => {
    const def = product.metadata?.default_color;
    return typeof def === "string" && byValue[def] ? def : undefined;
  });

  const lead = value ? byValue[value] ?? [] : [];
  const gallery = [...lead, ...images.filter((u) => !lead.includes(u))];

  return (
    <>
      <ProductGallery key={value ?? "all"} images={gallery} alt={value ? `${product.title} — ${value}` : product.title} />
      <ProductDetails
        product={product}
        initial={optionTitle && value ? { [optionTitle]: value } : undefined}
        swatches={optionTitle ? { title: optionTitle, images: byValue } : undefined}
        onChange={(title, v) => {
          if (title === optionTitle && byValue[v]) setValue(v);
        }}
      />
    </>
  );
}
