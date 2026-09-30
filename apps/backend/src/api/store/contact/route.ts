import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CONTACT_MODULE } from "../../../modules/contact";
import type ContactModuleService from "../../../modules/contact/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ContactModuleService>(CONTACT_MODULE);
  const body = req.body as any;
  if (!body?.name || !body?.email || !body?.message) {
    res.status(400).json({ message: "name, email, message required" });
    return;
  }
  const [submission] = await svc.createContactSubmissions([{
    name: String(body.name).slice(0, 200),
    email: String(body.email).slice(0, 200),
    phone: body.phone ? String(body.phone).slice(0, 50) : null,
    subject: body.subject ? String(body.subject).slice(0, 200) : null,
    message: String(body.message).slice(0, 5000),
    status: "new",
  }]);
  res.status(201).json({ ok: true, id: submission.id });
}
