import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../modules/cms";
import type CmsModuleService from "../../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [slots, count] = await svc.listAndCountHomeSlots({}, {
    take: 100, order: { position: "ASC" },
  });
  res.json({ slots, count });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [slot] = await svc.createHomeSlots([req.body as any]);
  res.status(201).json({ slot });
}
