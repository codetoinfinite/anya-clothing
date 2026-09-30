"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { updateLineItem, removeLineItem } from "@/lib/cart";
import { formatMoney } from "@/lib/medusa";
import type { LineItem } from "@/lib/medusa-types";

export function CartLineRow({ item, currency }: { item: LineItem; currency: string }) {
  const [pending, start] = useTransition();
  const thumb = item.thumbnail ?? item.variant?.product?.thumbnail ?? item.variant?.product?.images?.[0]?.url;
  const handle = item.variant?.product?.handle ?? "#";
  return (
    <div className={`grid grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_auto_auto] gap-4 py-6 border-b border-[var(--color-line)] ${pending ? "opacity-50" : ""}`}>
      <Link href={`/products/${handle}`} className="relative aspect-[3/4] bg-[var(--color-bg-alt)] overflow-hidden">
        {thumb && <Image src={thumb} alt={item.product_title ?? ""} fill sizes="100px" className="object-cover" />}
      </Link>
      <div>
        <Link href={`/products/${handle}`} className="text-sm font-medium hover:underline">
          {item.product_title ?? item.title}
        </Link>
        <div className="text-xs text-[var(--color-ink-muted)] mt-1">{item.variant_title}</div>
        <button
          onClick={() => start(() => removeLineItem(item.id))}
          className="mt-3 text-xs link-underline tracking-[0.14em] uppercase"
        >
          Remove
        </button>
      </div>
      <div className="flex items-center border border-[var(--color-line)] h-9 self-start col-span-2 sm:col-span-1 w-fit">
        <button onClick={() => start(() => updateLineItem(item.id, item.quantity - 1))} className="px-3 h-full">−</button>
        <span className="px-2 text-sm">{item.quantity}</span>
        <button onClick={() => start(() => updateLineItem(item.id, item.quantity + 1))} className="px-3 h-full">+</button>
      </div>
      <div className="text-sm self-start text-right whitespace-nowrap">
        {formatMoney((item.unit_price ?? 0) * item.quantity, currency)}
      </div>
    </div>
  );
}
