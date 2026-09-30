import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: any = req.scope.resolve("activity");
  const limit = Math.min(Math.max(Number(req.query.limit ?? 50) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);

  const filters: any = {};
  if (req.query.resource_type) filters.resource_type = String(req.query.resource_type);
  if (req.query.user_id) filters.user_id = String(req.query.user_id);
  if (req.query.method) filters.method = String(req.query.method).toUpperCase();

  const [entries, count] = await svc.listAndCountActivityEntries(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  });

  res.json({ entries, count, limit, offset });
}
