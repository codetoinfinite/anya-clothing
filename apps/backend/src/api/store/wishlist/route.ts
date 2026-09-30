import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WISHLIST_MODULE } from "../../../modules/wishlist";
import type WishlistModuleService from "../../../modules/wishlist/service";

function customerId(req: MedusaRequest): string | null {
  return (req as any).auth_context?.actor_id ?? null;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cid = customerId(req);
  if (!cid) { res.status(401).json({ message: "auth required" }); return; }
  const svc = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const items = await svc.listWishlistItems({ customer_id: cid }, { order: { created_at: "DESC" } });
  res.json({ items });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cid = customerId(req);
  if (!cid) { res.status(401).json({ message: "auth required" }); return; }
  const svc = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const body = req.body as any;
  if (!body?.product_id) { res.status(400).json({ message: "product_id required" }); return; }
  const existing = await svc.listWishlistItems({
    customer_id: cid, product_id: body.product_id, variant_id: body.variant_id ?? null,
  }, { take: 1 });
  if (existing.length) { res.json({ item: existing[0] }); return; }
  const [item] = await svc.createWishlistItems([{
    customer_id: cid, product_id: body.product_id, variant_id: body.variant_id ?? null,
  }]);
  res.status(201).json({ item });
}
