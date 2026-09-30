import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BLOG_MODULE } from "../../../../modules/blog";
import type BlogModuleService from "../../../../modules/blog/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  const [post] = await svc.listBlogPosts(
    { slug: req.params.slug, status: "published" },
    { take: 1 }
  );
  if (!post) { res.status(404).json({ message: "Not found" }); return; }
  res.json({ post });
}
