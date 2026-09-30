"use client";

import { useState } from "react";

export function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-10 border-t border-[var(--color-line)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-[var(--color-line)]">
            <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between py-5 text-left">
              <span className="text-base md:text-lg">{item.q}</span>
              <span className="text-xl">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <p className="pb-6 text-sm md:text-base text-[var(--color-ink-muted)] leading-relaxed">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
