import Image from "next/image";
import Link from "next/link";

const CATS = [
  { label: "Kurtas", href: "/collections/kurtas", image: "/images/pexels-28512776.jpg" },
  { label: "Dresses", href: "/collections/dresses", image: "/images/pexels-34077588.jpg" },
  { label: "Ethnic sets", href: "/collections/ethnic-sets", image: "/images/pexels-14100162.jpg" },
  { label: "Co-ords", href: "/collections/co-ords", image: "/images/pexels-16397414.jpg" },
  { label: "Bottom wear", href: "/collections/bottom-wear", image: "/images/pexels-30251753.jpg" },
  { label: "Jewellery", href: "/collections/jewellery", image: "/images/pexels-33154729.jpg" },
];

type CatItem = { label: string; href: string; image: string };

export function CategoryGrid({ items, eyebrow = "Shop by category", title = "Find your silhouette." }: { items?: CatItem[]; eyebrow?: string; title?: string } = {}) {
  const data = items && items.length > 0 ? items : CATS;
  return (
    <section className="container-wide py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="eyebrow mb-2">{eyebrow}</div>
          <h2 className="text-3xl md:text-4xl">{title}</h2>
        </div>
        <Link href="/collections" className="hidden md:inline link-underline text-sm">View all</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
        {data.map((c) => (
          <Link key={c.href} href={c.href} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-bg-alt)]">
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-[700ms] group-hover:scale-105"
              />
            </div>
            <div className="mt-3 text-sm font-medium">{c.label}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
