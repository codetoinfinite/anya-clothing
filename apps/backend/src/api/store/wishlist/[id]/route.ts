import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import type WishlistModuleService from "../../../../modules/wishlist/service";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const cid = (req as any).auth_context?.actor_id ?? null;
  if (!cid) { res.status(401).json({ message: "auth required" }); return; }
  const svc = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const item = await svc.retrieveWishlistItem(req.params.id).catch(() => null);
  if (!item || (item as any).customer_id !== cid) {
    res.status(404).json({ message: "Not found" }); return;
  }
  await svc.deleteWishlistItems(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
