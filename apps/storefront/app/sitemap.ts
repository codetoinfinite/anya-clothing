import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { listCollections, listProducts } from "@/lib/data";
import { POSTS } from "@/lib/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/blog",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/faq",
    "/search",
    "/login",
    "/register",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? ("daily" as const) : ("monthly" as const),
    priority: p === "" ? 1 : 0.5,
  }));

  const [collections, productList] = await Promise.all([listCollections(), listProducts({ limit: 200 })]);

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${base}/collections/${c.handle}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = productList.products.map((p) => ({
    url: `${base}/products/${p.handle}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes, ...blogRoutes];
}
