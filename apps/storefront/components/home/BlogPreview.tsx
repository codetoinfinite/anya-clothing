import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/cms";

export async function BlogPreview({ limit = 3, title = "Notes from the studio." }: { limit?: number; title?: string } = {}) {
  const posts = (await getBlogPosts(limit)).slice(0, limit);
  if (posts.length === 0) return null;
  return (
    <section className="container-wide py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="eyebrow mb-2">Journal</div>
          <h2 className="text-3xl md:text-4xl">{title}</h2>
        </div>
        <Link href="/blog" className="hidden md:inline link-underline text-sm">All posts</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-alt)]">
              {p.hero_image ? (
                <Image src={p.hero_image} alt={p.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.04]" />
              ) : null}
            </div>
            {p.tag ? <div className="mt-4 text-[11px] tracking-[0.16em] uppercase text-[var(--color-ink-muted)]">{p.tag}</div> : null}
            <h3 className="mt-2 text-xl">{p.title}</h3>
            {p.excerpt ? <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{p.excerpt}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
