import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BLOG_MODULE } from "../../../modules/blog";
import type BlogModuleService from "../../../modules/blog/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  const limit = Number(req.query.limit ?? 20);
  const offset = Number(req.query.offset ?? 0);
  const [posts, count] = await svc.listAndCountBlogPosts(
    { status: "published" },
    { take: limit, skip: offset, order: { published_at: "DESC" } }
  );
  res.json({ posts, count });
}
