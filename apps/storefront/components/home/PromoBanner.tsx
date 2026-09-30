import Image from "next/image";
import Link from "next/link";

const BANNERS = [
  {
    image: "/images/pexels-13562538.jpg",
    title: "Wedding guest, sorted.",
    copy: "Hand-finished co-ords and anarkalis for every function.",
    href: "/collections/festive",
    cta: "Shop the edit",
  },
  {
    image: "/images/pexels-34265189.jpg",
    title: "Soft cottons for everyday.",
    copy: "Mulmul, voile, hand-loom — pieces you keep returning to.",
    href: "/collections/kurtas",
    cta: "Shop everyday",
  },
];

export function PromoBanner() {
  return (
    <section className="container-wide py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {BANNERS.map((b) => (
        <Link key={b.href} href={b.href} className="group relative block aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image src={b.image} alt={b.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[800ms] group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute inset-x-6 md:inset-x-10 bottom-8 md:bottom-12 text-white">
            <h3 className="text-2xl md:text-4xl max-w-md">{b.title}</h3>
            <p className="mt-3 text-sm opacity-90 max-w-sm">{b.copy}</p>
            <span className="mt-5 inline-block link-underline text-xs tracking-[0.18em] uppercase">{b.cta}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
