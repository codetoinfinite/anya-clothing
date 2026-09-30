import { model } from "@medusajs/framework/utils";

export const ActivityEntry = model.define("admin_activity", {
  id: model.id().primaryKey(),
  user_id: model.text().nullable(),
  user_email: model.text().nullable(),
  action: model.text(),
  resource_type: model.text(),
  resource_id: model.text().nullable(),
  method: model.text(),
  path: model.text(),
  status: model.number().nullable(),
  diff: model.json().nullable(),
  ip: model.text().nullable(),
  ua: model.text().nullable(),
});
