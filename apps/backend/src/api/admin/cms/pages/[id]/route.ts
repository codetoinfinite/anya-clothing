import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../../modules/cms";
import type CmsModuleService from "../../../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  res.json({ page: await svc.retrieveCmsPage(req.params.id) });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const [page] = await svc.updateCmsPages([{ id: req.params.id, ...(req.body as any) }]);
  res.json({ page });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  await svc.deleteCmsPages(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
