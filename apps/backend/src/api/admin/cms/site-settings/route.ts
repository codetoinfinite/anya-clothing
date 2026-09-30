import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../modules/cms";
import type CmsModuleService from "../../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [existing] = await svc.listSiteSettings({}, { take: 1 });
  res.json({ settings: existing ?? null });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const body = req.body as any;
  const [existing] = await svc.listSiteSettings({}, { take: 1 });
  if (existing) {
    const [settings] = await svc.updateSiteSettings([{ id: existing.id, ...body }]);
    res.json({ settings });
  } else {
    const [settings] = await svc.createSiteSettings([body]);
    res.status(201).json({ settings });
  }
}
