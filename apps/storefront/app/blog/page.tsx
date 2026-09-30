import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/cms";

export const revalidate = 60;
export const metadata = { title: "Journal · Aanya", description: "Style notes, atelier stories, and care rituals from the Aanya studio." };

export default async function BlogIndex() {
  const posts = await getBlogPosts();
  return (
    <div className="container-wide py-12 md:py-20">
      <div className="eyebrow mb-2">Journal</div>
      <h1 className="text-4xl md:text-6xl mb-12">Stories from the atelier</h1>
      {posts.length === 0 ? (
        <p className="text-[var(--color-ink-muted)]">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
              <div className="aspect-[4/5] relative overflow-hidden bg-[var(--color-bg-alt)]">
                {p.hero_image ? (
                  <Image src={p.hero_image} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : null}
              </div>
              <div className="mt-4">
                <div className="eyebrow text-[var(--color-ink-muted)]">
                  {p.tag ?? "Journal"}
                  {p.published_at ? ` · ${new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                </div>
                <h2 className="mt-2 text-xl md:text-2xl group-hover:underline">{p.title}</h2>
                {p.excerpt ? <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{p.excerpt}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
