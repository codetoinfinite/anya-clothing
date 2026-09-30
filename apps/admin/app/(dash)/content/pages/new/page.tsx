import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { notifyStorefront } from "@/lib/revalidate";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createPage(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const body_text = String(formData.get("body") ?? "");
  const seo_title = String(formData.get("seo_title") ?? "").trim() || null;
  const seo_description = String(formData.get("seo_description") ?? "").trim() || null;
  if (!slug || !title) redirect("/content/pages/new?error=Slug+and+title+required");
  let r: { page: { id: string } };
  try {
    r = await adminFetch("/admin/cms/pages", {
      method: "POST",
      body: JSON.stringify({ slug, title, body: { text: body_text }, seo_title, seo_description }),
    });
  } catch (e: any) { redirect(`/content/pages/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/content/pages");
  await notifyStorefront({ tags: ["pages", `page:${slug}`], paths: [`/${slug}`] });
  redirect(`/content/pages/${r.page.id}`);
}

export default async function NewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-3xl">
      <PageHeader title="New page" back={{ href: "/content/pages", label: "Pages" }} />
      <form action={createPage} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" name="title"><input name="title" required className="input" /></Field>
          <Field label="Slug" name="slug" hint="e.g. about, shipping, faq"><input name="slug" required className="input" /></Field>
        </div>
        <Field label="Body" name="body"><textarea name="body" rows={14} className="textarea" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SEO title" name="seo_title"><input name="seo_title" className="input" /></Field>
          <Field label="SEO description" name="seo_description"><input name="seo_description" className="input" /></Field>
        </div>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/content/pages" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
