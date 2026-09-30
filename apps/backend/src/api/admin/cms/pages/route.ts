import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../modules/cms";
import type CmsModuleService from "../../../../modules/cms/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const limit = Number(req.query.limit ?? 100);
  const offset = Number(req.query.offset ?? 0);
  const [pages, count] = await svc.listAndCountCmsPages({}, {
    take: limit, skip: offset, order: { slug: "ASC" },
  });
  res.json({ pages, count });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve<CmsModuleService>(CMS_MODULE);
  const body = req.body as any;
  if (!body?.slug || !body?.title) {
    res.status(400).json({ message: "slug and title required" });
    return;
  }
  const [page] = await svc.createCmsPages([body]);
  res.status(201).json({ page });
}
