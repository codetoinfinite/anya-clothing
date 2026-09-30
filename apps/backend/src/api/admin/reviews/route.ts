import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REVIEW_MODULE } from "../../../modules/review";
import type ReviewModuleService from "../../../modules/review/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const status = (req.query.status as string) || undefined;
  const product_id = (req.query.product_id as string) || undefined;
  const filters: any = {};
  if (status) filters.status = status;
  if (product_id) filters.product_id = product_id;
  const [reviews, count] = await svc.listAndCountReviews(filters, {
    take: limit, skip: offset, order: { created_at: "DESC" },
  });
  res.json({ reviews, count, limit, offset });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  const body = req.body as any;
  const [review] = await svc.createReviews([body]);
  res.status(201).json({ review });
}
