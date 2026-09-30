import { model } from "@medusajs/framework/utils";

export const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  excerpt: model.text().nullable(),
  body: model.json().nullable(),
  hero_image: model.text().nullable(),
  tag: model.text().nullable(),
  author: model.text().nullable(),
  status: model.enum(["draft", "published"]).default("draft"),
  published_at: model.dateTime().nullable(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
});
