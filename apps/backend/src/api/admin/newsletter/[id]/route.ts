import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter";
import type NewsletterModuleService from "../../../../modules/newsletter/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE);
  const [subscriber] = await svc.updateNewsletterSubscribers([{ id: req.params.id, ...(req.body as any) }]);
  res.json({ subscriber });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE);
  await svc.deleteNewsletterSubscribers(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
