import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { NEWSLETTER_MODULE } from "../../../modules/newsletter";
import type NewsletterModuleService from "../../../modules/newsletter/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE);
  const limit = Number(req.query.limit ?? 100);
  const offset = Number(req.query.offset ?? 0);
  const status = (req.query.status as string) || undefined;
  const filters: any = {};
  if (status) filters.status = status;
  const [subscribers, count] = await svc.listAndCountNewsletterSubscribers(filters, {
    take: limit, skip: offset, order: { created_at: "DESC" },
  });
  res.json({ subscribers, count, limit, offset });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE);
  const [subscriber] = await svc.createNewsletterSubscribers([req.body as any]);
  res.status(201).json({ subscriber });
}
