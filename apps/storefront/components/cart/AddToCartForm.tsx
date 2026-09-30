"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLineItem } from "@/lib/cart";

export function AddToCartForm({
  variantId,
  disabled,
  label = "Add to bag",
}: {
  variantId: string | null;
  disabled?: boolean;
  label?: string;
}) {
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-[var(--color-line)] h-12">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 h-full" type="button">−</button>
        <span className="px-3 min-w-8 text-center">{qty}</span>
        <button onClick={() => setQty((q) => q + 1)} className="px-4 h-full" type="button">+</button>
      </div>
      <button
        disabled={disabled || !variantId || pending}
        onClick={() =>
          start(async () => {
            if (!variantId) return;
            await addLineItem(variantId, qty);
            setDone(true);
            router.refresh();
            setTimeout(() => setDone(false), 1600);
          })
        }
        className="btn btn-primary flex-1 h-12 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? "Adding…" : done ? "✓ Added" : label}
      </button>
    </div>
  );
}
