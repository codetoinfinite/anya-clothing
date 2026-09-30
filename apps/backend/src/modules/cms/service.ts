import { MedusaService } from "@medusajs/framework/utils";
import { CmsPage } from "./models/page";
import { SiteSetting } from "./models/site-setting";
import { HomeSlot } from "./models/home-slot";

class CmsModuleService extends MedusaService({ CmsPage, SiteSetting, HomeSlot }) {}

export default CmsModuleService;
