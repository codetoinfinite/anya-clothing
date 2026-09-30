import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CONTACT_MODULE } from "../../../modules/contact";
import type ContactModuleService from "../../../modules/contact/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ContactModuleService>(CONTACT_MODULE);
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const status = (req.query.status as string) || undefined;
  const filters: any = {};
  if (status) filters.status = status;
  const [submissions, count] = await svc.listAndCountContactSubmissions(filters, {
    take: limit, skip: offset, order: { created_at: "DESC" },
  });
  res.json({ submissions, count, limit, offset });
}
