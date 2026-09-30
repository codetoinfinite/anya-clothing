import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CONTACT_MODULE } from "../../../../modules/contact";
import type ContactModuleService from "../../../../modules/contact/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ContactModuleService>(CONTACT_MODULE);
  res.json({ submission: await svc.retrieveContactSubmission(req.params.id) });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ContactModuleService>(CONTACT_MODULE);
  const [submission] = await svc.updateContactSubmissions([{ id: req.params.id, ...(req.body as any) }]);
  res.json({ submission });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<ContactModuleService>(CONTACT_MODULE);
  await svc.deleteContactSubmissions(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
