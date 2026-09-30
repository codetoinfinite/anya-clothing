import { model } from "@medusajs/framework/utils";

export const CmsPage = model.define("cms_page", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  body: model.json().nullable(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  updated_by_user_id: model.text().nullable(),
});
