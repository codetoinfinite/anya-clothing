import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPost, getBlogPosts, bodyToParagraphs } from "@/lib/cms";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getBlogPost(slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.seo_title ?? p.title} · Journal`,
    description: p.seo_description ?? p.excerpt ?? undefined,
    openGraph: p.hero_image ? { images: [p.hero_image] } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const all = await getBlogPosts(6);
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 2);
  const paragraphs = bodyToParagraphs(post.body);
  const date = post.published_at ?? post.created_at;

  return (
    <article className="py-12 md:py-20">
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt ?? ""}
        image={post.hero_image ?? ""}
        datePublished={date}
        author={post.author ?? env.brandName}
        url={`${env.siteUrl}/blog/${post.slug}`}
      />
      <div className="container-narrow">
        <nav className="text-xs text-[var(--color-ink-muted)] mb-6">
          <Link href="/blog" className="hover:underline">Journal</Link>
          {post.tag ? <> · <span>{post.tag}</span></> : null}
        </nav>
        <div className="eyebrow text-[var(--color-ink-muted)]">
          {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          {post.author ? ` · ${post.author}` : ""}
        </div>
        <h1 className="mt-3 text-4xl md:text-6xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-4 text-lg text-[var(--color-ink-muted)]">{post.excerpt}</p> : null}
      </div>
      {post.hero_image ? (
        <div className="container-wide mt-10">
          <div className="aspect-[16/9] relative overflow-hidden bg-[var(--color-bg-alt)]">
            <Image src={post.hero_image} alt={post.title} fill className="object-cover" sizes="100vw" priority />
          </div>
        </div>
      ) : null}
      <div className="container-narrow mt-10 prose">
        {paragraphs.map((para, i) => (
          <p key={i} className="mt-6 text-base md:text-lg leading-relaxed">{para}</p>
        ))}
      </div>
      {related.length > 0 ? (
        <div className="container-wide mt-20 border-t border-[var(--color-line)] pt-12">
          <h2 className="eyebrow mb-6">Keep reading</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex gap-4">
                <div className="w-32 h-32 relative shrink-0 overflow-hidden bg-[var(--color-bg-alt)]">
                  {p.hero_image ? (
                    <Image src={p.hero_image} alt={p.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="128px" />
                  ) : null}
                </div>
                <div>
                  {p.tag ? <div className="eyebrow text-[var(--color-ink-muted)]">{p.tag}</div> : null}
                  <h3 className="mt-1 text-lg group-hover:underline">{p.title}</h3>
                  {p.excerpt ? <p className="mt-1 text-sm text-[var(--color-ink-muted)] line-clamp-2">{p.excerpt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
