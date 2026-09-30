"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { formatMoney } from "@/lib/medusa";
import { AddToCartForm } from "@/components/cart/AddToCartForm";
import { WishlistButton } from "./WishlistButton";

type OptionMap = Record<string, string>;

export function ProductDetails({
  product,
  initial,
  swatches,
  onChange,
}: {
  product: Product;
  initial?: OptionMap;
  swatches?: { title: string; images: Record<string, string[]> };
  onChange?: (title: string, value: string) => void;
}) {
  const [selected, setSelected] = useState<OptionMap>(() => {
    const init: OptionMap = {};
    product.options?.forEach((o) => {
      if (o.values?.[0]) init[o.title] = o.values[0].value;
    });
    return { ...init, ...initial };
  });
  const [openTab, setOpenTab] = useState<string | null>("description");

  const matchedVariant = useMemo(() => {
    const titles = product.options?.map((o) => o.title) ?? [];
    return product.variants?.find((v) => {
      const vmap: Record<string, string> = {};
      v.options?.forEach((o) => {
        const title = product.options?.find((p) => p.id === o.option_id)?.title;
        if (title) vmap[title] = o.value;
      });
      return titles.every((t) => vmap[t] === selected[t]);
    });
  }, [product, selected]);

  const price = matchedVariant?.calculated_price ?? product.variants?.[0]?.calculated_price;
  const inStock = (matchedVariant?.inventory_quantity ?? 1) > 0;

  return (
    <div>
      <div className="eyebrow mb-2">{product.collection?.title ?? "Atelier"}</div>
      <h1 className="text-3xl md:text-4xl">{product.title}</h1>
      {price && (
        <div className="mt-4 text-xl">
          {formatMoney(price.calculated_amount, price.currency_code)}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {product.options?.map((opt) => (
          <div key={opt.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-[0.16em] uppercase">{opt.title}</span>
              <span className="text-xs text-[var(--color-ink-muted)]">{selected[opt.title]}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((v) => {
                const on = selected[opt.title] === v.value;
                const isColor = opt.title.toLowerCase() === "color";
                const swatch = swatches?.title === opt.title ? swatches.images[v.value]?.[0] : undefined;
                return (
                  <button
                    key={v.value}
                    onClick={() => {
                      setSelected((s) => ({ ...s, [opt.title]: v.value }));
                      onChange?.(opt.title, v.value);
                    }}
                    aria-label={`${opt.title}: ${v.value}`}
                    className={
                      swatch
                        ? `flex items-center gap-2 h-11 pl-1 pr-3 border text-sm ${on ? "border-[var(--color-ink)]" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"}`
                        : isColor
                        ? `h-9 px-3 border ${on ? "border-[var(--color-ink)]" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"}`
                        : `h-10 min-w-10 px-4 border text-sm ${on ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"}`
                    }
                  >
                    {swatch && (
                      <span className="relative h-9 w-7 overflow-hidden">
                        <Image src={swatch} alt="" fill sizes="28px" className="object-cover" />
                      </span>
                    )}
                    {v.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-stretch gap-3">
        <div className="flex-1">
          <AddToCartForm
            variantId={matchedVariant?.id ?? null}
            disabled={!inStock}
            label={inStock ? "Add to bag" : "Sold out"}
          />
        </div>
        <WishlistButton productId={product.id} />
      </div>

      <div className="mt-10 border-t border-[var(--color-line)]">
        {[
          { id: "description", label: "Description", body: product.description ?? "Hand-finished piece from our small-batch atelier." },
          { id: "fabric", label: "Fabric & Care", body: "Cotton-blend, lined where needed. Cold hand-wash. Line-dry in shade. Iron on reverse." },
          { id: "size", label: "Size guide", body: "Model is 5'8\" wearing size S. Refer to body-measurement chart in cm/inches." },
          { id: "shipping", label: "Shipping & Returns", body: "Free shipping over ₹2,499 in India. International from ₹2,500. 14-day easy return." },
        ].map((t) => {
          const open = openTab === t.id;
          return (
            <div key={t.id} className="border-b border-[var(--color-line)]">
              <button
                onClick={() => setOpenTab(open ? null : t.id)}
                className="flex w-full items-center justify-between py-4 text-sm tracking-[0.06em] uppercase"
              >
                {t.label}
                <span className="text-lg">{open ? "−" : "+"}</span>
              </button>
              {open && <div className="pb-5 text-sm text-[var(--color-ink-muted)] leading-relaxed">{t.body}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
