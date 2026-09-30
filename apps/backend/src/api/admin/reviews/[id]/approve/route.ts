import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REVIEW_MODULE } from "../../../../../modules/review";
import type ReviewModuleService from "../../../../../modules/review/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  const [review] = await svc.updateReviews([{ id: req.params.id, status: "approved" }]);
  res.json({ review });
}
