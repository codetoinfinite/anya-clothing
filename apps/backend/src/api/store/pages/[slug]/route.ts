import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../modules/cms";
import type CmsModuleService from "../../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [page] = await svc.listCmsPages({ slug: req.params.slug }, { take: 1 });
  if (!page) { res.status(404).json({ message: "Not found" }); return; }
  res.json({ page });
}
