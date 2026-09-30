import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../modules/cms";
import type CmsModuleService from "../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const slots = await svc.listHomeSlots({ enabled: true }, { order: { position: "ASC" } });
  res.json({ slots });
}
