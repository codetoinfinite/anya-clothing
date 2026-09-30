import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REVIEW_MODULE } from "../../../modules/review";
import type ReviewModuleService from "../../../modules/review/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  const product_id = req.query.product_id as string;
  if (!product_id) { res.status(400).json({ message: "product_id required" }); return; }
  const reviews = await svc.listReviews(
    { product_id, status: "approved" },
    { order: { created_at: "DESC" }, take: 50 }
  );
  res.json({ reviews });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE);
  const body = req.body as any;
  if (!body?.product_id || !body?.rating) {
    res.status(400).json({ message: "product_id and rating required" });
    return;
  }
  const [review] = await svc.createReviews([{
    product_id: body.product_id,
    variant_id: body.variant_id ?? null,
    customer_id: body.customer_id ?? null,
    customer_name: body.customer_name ?? null,
    customer_email: body.customer_email ?? null,
    rating: Math.max(1, Math.min(5, Number(body.rating))),
    title: body.title ?? null,
    body: body.body ?? null,
    images: body.images ?? null,
    status: "pending",
  }]);
  res.status(201).json({ review });
}
