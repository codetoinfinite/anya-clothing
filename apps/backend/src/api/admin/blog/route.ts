import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BLOG_MODULE } from "../../../modules/blog";
import type BlogModuleService from "../../../modules/blog/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const q = (req.query.q as string) || undefined;
  const status = (req.query.status as string) || undefined;

  const filters: any = {};
  if (status) filters.status = status;
  if (q) filters.title = { $ilike: `%${q}%` };

  const [posts, count] = await svc.listAndCountBlogPosts(filters, {
    take: limit,
    skip: offset,
    order: { published_at: "DESC" },
  });
  res.json({ posts, count, limit, offset });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  const body = req.body as any;
  if (!body?.slug || !body?.title) {
    res.status(400).json({ message: "slug and title required" });
    return;
  }
  const [post] = await svc.createBlogPosts([{
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt ?? null,
    body: body.body ?? null,
    hero_image: body.hero_image ?? null,
    tag: body.tag ?? null,
    author: body.author ?? null,
    status: body.status ?? "draft",
    published_at: body.published_at ? new Date(body.published_at) : null,
    seo_title: body.seo_title ?? null,
    seo_description: body.seo_description ?? null,
  }]);
  res.status(201).json({ post });
}
