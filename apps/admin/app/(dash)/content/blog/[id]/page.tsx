import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { notifyStorefront } from "@/lib/revalidate";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: { text?: string } | null;
  hero_image?: string | null;
  tag?: string | null;
  author?: string | null;
  status: string;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
};

async function updatePost(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const body_text = String(formData.get("body") ?? "");
  const hero_image = String(formData.get("hero_image") ?? "").trim() || null;
  const tag = String(formData.get("tag") ?? "").trim() || null;
  const author = String(formData.get("author") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft");
  const seo_title = String(formData.get("seo_title") ?? "").trim() || null;
  const seo_description = String(formData.get("seo_description") ?? "").trim() || null;
  try {
    await adminFetch(`/admin/blog/${id}`, {
      method: "POST",
      body: JSON.stringify({
        title, slug, excerpt, body: { text: body_text }, hero_image, tag, author, status, seo_title, seo_description,
        published_at: status === "published" ? new Date().toISOString() : null,
      }),
    });
  } catch (e: any) { redirect(`/content/blog/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/content/blog");
  revalidatePath(`/content/blog/${id}`);
  await notifyStorefront({ tags: ["blog"], paths: ["/blog"] });
  redirect(`/content/blog/${id}?ok=1`);
}

async function deletePost(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/blog/${id}`, { method: "DELETE" });
  revalidatePath("/content/blog");
  await notifyStorefront({ tags: ["blog"], paths: ["/blog"] });
  redirect("/content/blog");
}

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { post } = await adminFetch<{ post: Post }>(`/admin/blog/${id}`);
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={post.title} back={{ href: "/content/blog", label: "Blog" }} subtitle={`/${post.slug}`} />
      <form action={updatePost} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={post.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" name="title"><input name="title" defaultValue={post.title} required className="input" /></Field>
          <Field label="Slug" name="slug"><input name="slug" defaultValue={post.slug} required className="input" /></Field>
        </div>
        <Field label="Excerpt" name="excerpt"><textarea name="excerpt" rows={2} defaultValue={post.excerpt ?? ""} className="textarea" /></Field>
        <Field label="Body" name="body"><textarea name="body" rows={14} defaultValue={post.body?.text ?? ""} className="textarea" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tag" name="tag"><input name="tag" defaultValue={post.tag ?? ""} className="input" /></Field>
          <Field label="Author" name="author"><input name="author" defaultValue={post.author ?? ""} className="input" /></Field>
          <Field label="Status" name="status">
            <select name="status" className="input" defaultValue={post.status}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Hero image URL" name="hero_image"><input name="hero_image" defaultValue={post.hero_image ?? ""} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SEO title" name="seo_title"><input name="seo_title" defaultValue={post.seo_title ?? ""} className="input" /></Field>
          <Field label="SEO description" name="seo_description"><input name="seo_description" defaultValue={post.seo_description ?? ""} className="input" /></Field>
        </div>
        <div className="flex gap-2"><button className="btn btn-primary">Save</button><Link href="/content/blog" className="btn btn-outline">Back</Link></div>
      </form>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deletePost} hidden={{ id }} label="Delete post" />
      </div>
    </div>
  );
}
