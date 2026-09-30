import { model } from "@medusajs/framework/utils";

export const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
}).indexes([{ on: ["customer_id", "product_id", "variant_id"], unique: true }]);
