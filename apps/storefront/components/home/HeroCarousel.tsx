"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type Slide = { image: string; eyebrow: string; title: string; copy: string; ctaLabel: string; ctaHref: string };

const SLIDES: Slide[] = [
  {
    image: "/images/pexels-8192360.jpg",
    eyebrow: "Spring · Summer · 26",
    title: "A new season of hand-loomed kurtas.",
    copy: "Made in limited runs across Jaipur, Lucknow, and Kolkata.",
    ctaLabel: "Shop new arrivals",
    ctaHref: "/collections/new-arrivals",
  },
  {
    image: "/images/pexels-20736212.jpg",
    eyebrow: "Festive edit",
    title: "Quiet luxury, woven slowly.",
    copy: "Banarasi silks, mulmul, hand-block prints — pieces meant for re-wear.",
    ctaLabel: "Explore festive",
    ctaHref: "/collections/festive",
  },
  {
    image: "/images/pexels-34222609.jpg",
    eyebrow: "End of season",
    title: "Up to 60% off select silhouettes.",
    copy: "Quietly priced, never compromised.",
    ctaLabel: "Shop sale",
    ctaHref: "/collections/sale",
  },
];

export function HeroCarousel({ slides }: { slides?: Slide[] } = {}) {
  const data = slides && slides.length > 0 ? slides : SLIDES;
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 32 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 6500);
    api.on("select", () => setActive(api.selectedScrollSnap()));
    return () => clearInterval(id);
  }, [api]);

  const scrollTo = useCallback((i: number) => api?.scrollTo(i), [api]);

  return (
    <section className="relative">
      <div ref={ref} className="overflow-hidden">
        <div className="flex">
          {data.map((s, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%] h-[78vh] min-h-[520px] max-h-[820px]">
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="container-wide absolute inset-0 flex items-end pb-16 md:pb-24 text-white">
                <div className="max-w-xl">
                  <div className="text-[11px] tracking-[0.22em] uppercase opacity-90">{s.eyebrow}</div>
                  <h2 className="mt-4 text-4xl md:text-6xl leading-[1.05]">{s.title}</h2>
                  <p className="mt-4 text-sm md:text-base opacity-90">{s.copy}</p>
                  <Link href={s.ctaHref} className="btn btn-accent mt-8">{s.ctaLabel}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {data.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-[3px] w-9 transition-all ${active === i ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
