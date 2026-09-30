import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../../modules/cms";
import type CmsModuleService from "../../../../../modules/cms/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [slot] = await svc.updateHomeSlots([{ id: req.params.id, ...(req.body as any) }]);
  res.json({ slot });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  await svc.deleteHomeSlots(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
