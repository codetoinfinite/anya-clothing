import { cache } from "react";
import { env } from "./env";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: { text?: string } | null;
  hero_image: string | null;
  tag: string | null;
  author: string | null;
  status: "draft" | "published";
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  body: { text?: string; faq?: { groups?: { heading: string; items: { q: string; a: string }[] }[] } } | null;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

export type SiteSettings = {
  brand_name: string | null;
  logo_url: string | null;
  announcement_text: string | null;
  announcement_link: string | null;
  social_links: Record<string, string> | null;
  contact_email: string | null;
  contact_phone: string | null;
  footer_copy: string | null;
};

export type HomeSlot = {
  id: string;
  slot: string;
  position: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- free-form CMS JSON, shape depends on slot
  payload: any;
  enabled: boolean;
};

// Getters are wrapped in cache() so generateMetadata + page share one request per render. Next 15.0's fetch
// dedupe otherwise leaves the duplicate call pending forever when the first one rejects (backend down),
// which hangs `next build`.
async function storeGet<T>(path: string, init: { revalidate?: number; tags?: string[] } = {}): Promise<T | null> {
  const url = `${env.medusaUrl}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "x-publishable-api-key": env.publishableKey, accept: "application/json" },
      next: { revalidate: init.revalidate ?? 60, tags: init.tags },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.warn("[cms]", path, (e as Error).message);
    return null;
  }
}

export const getBlogPosts = cache(async (limit = 50): Promise<BlogPost[]> => {
  const data = await storeGet<{ posts: BlogPost[] }>(`/store/blog?limit=${limit}`, { revalidate: 60, tags: ["blog"] });
  return data?.posts ?? [];
});

export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const data = await storeGet<{ post: BlogPost }>(`/store/blog/${slug}`, { revalidate: 60, tags: ["blog", `blog:${slug}`] });
  return data?.post ?? null;
});

export const getPage = cache(async (slug: string): Promise<CmsPage | null> => {
  const data = await storeGet<{ page: CmsPage }>(`/store/pages/${slug}`, { revalidate: 300, tags: ["pages", `page:${slug}`] });
  return data?.page ?? null;
});

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const data = await storeGet<{ settings: SiteSettings }>(`/store/site-settings`, { revalidate: 300, tags: ["site-settings"] });
  return data?.settings ?? null;
});

export const getHomeSlots = cache(async (): Promise<HomeSlot[]> => {
  const data = await storeGet<{ slots: HomeSlot[] }>(`/store/home-content`, { revalidate: 60, tags: ["home-slots"] });
  return (data?.slots ?? []).filter((s) => s.enabled).sort((a, b) => a.position - b.position);
});

export function bodyToParagraphs(body: { text?: string } | null | undefined): string[] {
  const text = body?.text ?? "";
  if (!text) return [];
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}
