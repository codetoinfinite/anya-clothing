import { model } from "@medusajs/framework/utils";

export const HomeSlot = model.define("home_slot", {
  id: model.id().primaryKey(),
  slot: model.text(),
  position: model.number().default(0),
  payload: model.json().nullable(),
  enabled: model.boolean().default(true),
});
