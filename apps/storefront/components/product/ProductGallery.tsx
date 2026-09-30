"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  if (!main) {
    return <div className="aspect-[3/4] bg-[var(--color-bg-alt)] grid place-items-center text-sm text-[var(--color-ink-soft)]">no image</div>;
  }
  return (
    <div className="md:flex md:gap-4">
      <div className="hidden md:flex flex-col gap-2 w-20">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative aspect-[3/4] overflow-hidden border ${active === i ? "border-[var(--color-ink)]" : "border-transparent"}`}
          >
            <Image src={img} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-[var(--color-bg-alt)]">
        <Image src={main} alt={alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex md:hidden gap-2 mt-3 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative h-16 w-12 flex-shrink-0 border ${active === i ? "border-[var(--color-ink)]" : "border-transparent"}`}
          >
            <Image src={img} alt="" fill sizes="48px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
