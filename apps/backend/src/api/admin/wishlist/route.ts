import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WISHLIST_MODULE } from "../../../modules/wishlist";
import type WishlistModuleService from "../../../modules/wishlist/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const customer_id = (req.query.customer_id as string) || undefined;
  const product_id = (req.query.product_id as string) || undefined;
  const filters: any = {};
  if (customer_id) filters.customer_id = customer_id;
  if (product_id) filters.product_id = product_id;
  const [items, count] = await svc.listAndCountWishlistItems(filters, {
    take: limit, skip: offset, order: { created_at: "DESC" },
  });
  res.json({ items, count, limit, offset });
}
