"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/lib/wishlist";

export function WishlistButton({ productId, initial = false }: { productId: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() =>
        start(async () => {
          const r = await toggleWishlist(productId);
          setOn(r);
        })
      }
      disabled={pending}
      className={`h-12 w-12 border grid place-items-center transition-colors ${on ? "border-[var(--color-sale)] text-[var(--color-sale)]" : "border-[var(--color-line)] hover:border-[var(--color-ink)]"}`}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
