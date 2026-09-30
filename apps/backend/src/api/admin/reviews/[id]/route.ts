import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REVIEW_MODULE } from "../../../../modules/review";
import type ReviewModuleService from "../../../../modules/review/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  res.json({ review: await svc.retrieveReview(req.params.id) });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  const [review] = await svc.updateReviews([{ id: req.params.id, ...(req.body as any) }]);
  res.json({ review });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  await svc.deleteReviews(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
