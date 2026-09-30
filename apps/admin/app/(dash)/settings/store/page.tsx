import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { notifyStorefront } from "@/lib/revalidate";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

type Settings = {
  id?: string;
  brand_name?: string;
  logo_url?: string | null;
  announcement_text?: string | null;
  announcement_link?: string | null;
  social_links?: Record<string, string> | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  footer_copy?: string | null;
};

async function saveSettings(formData: FormData) {
  "use server";
  const body: any = {
    brand_name: String(formData.get("brand_name") ?? "").trim() || undefined,
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    announcement_text: String(formData.get("announcement_text") ?? "").trim() || null,
    announcement_link: String(formData.get("announcement_link") ?? "").trim() || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
    footer_copy: String(formData.get("footer_copy") ?? "").trim() || null,
    social_links: {
      instagram: String(formData.get("social_instagram") ?? "").trim() || undefined,
      twitter: String(formData.get("social_twitter") ?? "").trim() || undefined,
      facebook: String(formData.get("social_facebook") ?? "").trim() || undefined,
    },
  };
  try { await adminFetch("/admin/cms/site-settings", { method: "POST", body: JSON.stringify(body) }); }
  catch (e: any) { redirect(`/settings/store?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/settings/store");
  await notifyStorefront({ tags: ["site-settings"], paths: ["/"] });
  redirect("/settings/store?ok=1");
}

export default async function StoreSettings({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const res = await adminFetch<{ settings: Settings | null }>("/admin/cms/site-settings");
  const s = res.settings ?? {};
  const social = s.social_links ?? {};
  return (
    <div className="max-w-2xl">
      <PageHeader title="Store settings" subtitle="Brand, announcement bar, social links, footer." />
      <form action={saveSettings} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <Field label="Brand name" name="brand_name"><input name="brand_name" defaultValue={s.brand_name ?? ""} className="input" /></Field>
        <Field label="Logo URL" name="logo_url"><input name="logo_url" defaultValue={s.logo_url ?? ""} className="input" /></Field>
        <Field label="Announcement text" name="announcement_text"><input name="announcement_text" defaultValue={s.announcement_text ?? ""} className="input" /></Field>
        <Field label="Announcement link" name="announcement_link"><input name="announcement_link" defaultValue={s.announcement_link ?? ""} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact email" name="contact_email"><input name="contact_email" type="email" defaultValue={s.contact_email ?? ""} className="input" /></Field>
          <Field label="Contact phone" name="contact_phone"><input name="contact_phone" defaultValue={s.contact_phone ?? ""} className="input" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Instagram" name="social_instagram"><input name="social_instagram" defaultValue={social.instagram ?? ""} className="input" /></Field>
          <Field label="Twitter" name="social_twitter"><input name="social_twitter" defaultValue={social.twitter ?? ""} className="input" /></Field>
          <Field label="Facebook" name="social_facebook"><input name="social_facebook" defaultValue={social.facebook ?? ""} className="input" /></Field>
        </div>
        <Field label="Footer copy" name="footer_copy"><textarea name="footer_copy" rows={3} defaultValue={s.footer_copy ?? ""} className="textarea" /></Field>
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  );
}
