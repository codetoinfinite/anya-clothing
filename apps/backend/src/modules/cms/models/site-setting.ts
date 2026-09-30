import { model } from "@medusajs/framework/utils";

export const SiteSetting = model.define("site_setting", {
  id: model.id().primaryKey(),
  brand_name: model.text().nullable(),
  logo_url: model.text().nullable(),
  announcement_text: model.text().nullable(),
  announcement_link: model.text().nullable(),
  announcement_enabled: model.boolean().default(false),
  social_links: model.json().nullable(),
  contact_email: model.text().nullable(),
  contact_phone: model.text().nullable(),
  footer_copy: model.text().nullable(),
});
