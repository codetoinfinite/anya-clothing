import { model } from "@medusajs/framework/utils";

export const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  customer_name: model.text().nullable(),
  customer_email: model.text().nullable(),
  rating: model.number(),
  title: model.text().nullable(),
  body: model.text().nullable(),
  images: model.json().nullable(),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
});
