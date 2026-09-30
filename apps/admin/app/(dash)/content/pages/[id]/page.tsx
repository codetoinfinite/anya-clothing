import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { notifyStorefront } from "@/lib/revalidate";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";

type Page = { id: string; slug: string; title: string; body?: { text?: string } | null; seo_title?: string | null; seo_description?: string | null };

async function updatePage(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const body_text = String(formData.get("body") ?? "");
  const seo_title = String(formData.get("seo_title") ?? "").trim() || null;
  const seo_description = String(formData.get("seo_description") ?? "").trim() || null;
  try { await adminFetch(`/admin/cms/pages/${id}`, { method: "POST", body: JSON.stringify({ slug, title, body: { text: body_text }, seo_title, seo_description }) }); }
  catch (e: any) { redirect(`/content/pages/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/content/pages");
  revalidatePath(`/content/pages/${id}`);
  await notifyStorefront({ tags: ["pages", `page:${slug}`], paths: [`/${slug}`] });
  redirect(`/content/pages/${id}?ok=1`);
}

async function deletePage(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/cms/pages/${id}`, { method: "DELETE" });
  revalidatePath("/content/pages");
  await notifyStorefront({ tags: ["pages"] });
  redirect("/content/pages");
}

export default async function EditPageDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { page } = await adminFetch<{ page: Page }>(`/admin/cms/pages/${id}`);
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={page.title} back={{ href: "/content/pages", label: "Pages" }} subtitle={`/${page.slug}`} />
      <form action={updatePage} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={page.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" name="title"><input name="title" defaultValue={page.title} required className="input" /></Field>
          <Field label="Slug" name="slug"><input name="slug" defaultValue={page.slug} required className="input" /></Field>
        </div>
        <Field label="Body" name="body"><textarea name="body" rows={16} defaultValue={page.body?.text ?? ""} className="textarea" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SEO title" name="seo_title"><input name="seo_title" defaultValue={page.seo_title ?? ""} className="input" /></Field>
          <Field label="SEO description" name="seo_description"><input name="seo_description" defaultValue={page.seo_description ?? ""} className="input" /></Field>
        </div>
        <div className="flex gap-2"><button className="btn btn-primary">Save</button><Link href="/content/pages" className="btn btn-outline">Back</Link></div>
      </form>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deletePage} hidden={{ id }} label="Delete page" />
      </div>
    </div>
  );
}
