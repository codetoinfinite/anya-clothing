import { model } from "@medusajs/framework/utils";

export const ContactSubmission = model.define("contact_submission", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  subject: model.text().nullable(),
  message: model.text(),
  status: model.enum(["new", "read", "replied", "archived"]).default("new"),
  replied_at: model.dateTime().nullable(),
  replied_by_user_id: model.text().nullable(),
});
