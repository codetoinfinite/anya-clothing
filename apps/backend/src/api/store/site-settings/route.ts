import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../modules/cms";
import type CmsModuleService from "../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [settings] = await svc.listSiteSettings({}, { take: 1 });
  res.json({ settings: settings ?? null });
}
