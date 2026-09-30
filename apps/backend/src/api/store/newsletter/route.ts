import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { NEWSLETTER_MODULE } from "../../../modules/newsletter";
import type NewsletterModuleService from "../../../modules/newsletter/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<NewsletterModuleService>(NEWSLETTER_MODULE);
  const body = req.body as any;
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    res.status(400).json({ message: "email required" });
    return;
  }
  const [existing] = await svc.listNewsletterSubscribers({ email }, { take: 1 });
  if (existing) {
    if (existing.status === "unsubscribed") {
      await svc.updateNewsletterSubscribers([{ id: existing.id, status: "pending", unsubscribed_at: null }]);
    }
    res.json({ ok: true, already: true });
    return;
  }
  await svc.createNewsletterSubscribers([{
    email,
    status: "pending",
    source: body.source ?? "storefront",
  }]);
  res.status(201).json({ ok: true });
}
