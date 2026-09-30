import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BLOG_MODULE } from "../../../../modules/blog";
import type BlogModuleService from "../../../../modules/blog/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  const post = await svc.retrieveBlogPost(req.params.id);
  res.json({ post });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  const body = req.body as any;
  const update: any = { id: req.params.id };
  for (const k of ["slug","title","excerpt","body","hero_image","tag","author","status","seo_title","seo_description"]) {
    if (k in body) update[k] = body[k];
  }
  if ("published_at" in body) update.published_at = body.published_at ? new Date(body.published_at) : null;
  const [post] = await svc.updateBlogPosts([update]);
  res.json({ post });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<BlogModuleService>(BLOG_MODULE);
  await svc.deleteBlogPosts(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
