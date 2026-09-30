import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { notifyStorefront } from "@/lib/revalidate";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createPost(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || undefined;
  const body_text = String(formData.get("body") ?? "").trim();
  const hero_image = String(formData.get("hero_image") ?? "").trim() || null;
  const tag = String(formData.get("tag") ?? "").trim() || null;
  const author = String(formData.get("author") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft");
  if (!slug || !title) redirect("/content/blog/new?error=Slug+and+title+required");
  let r: { post: { id: string } };
  try {
    r = await adminFetch("/admin/blog", {
      method: "POST",
      body: JSON.stringify({
        slug, title, excerpt,
        body: { text: body_text },
        hero_image, tag, author, status,
        published_at: status === "published" ? new Date().toISOString() : null,
      }),
    });
  } catch (e: any) { redirect(`/content/blog/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/content/blog");
  await notifyStorefront({ tags: ["blog"], paths: ["/blog"] });
  redirect(`/content/blog/${r.post.id}`);
}

export default async function NewPost({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-3xl">
      <PageHeader title="New post" back={{ href: "/content/blog", label: "Blog" }} />
      <form action={createPost} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" name="title"><input name="title" required className="input" /></Field>
          <Field label="Slug" name="slug"><input name="slug" required className="input" /></Field>
        </div>
        <Field label="Excerpt" name="excerpt"><textarea name="excerpt" rows={2} className="textarea" /></Field>
        <Field label="Body" name="body"><textarea name="body" rows={10} className="textarea" placeholder="Plain text or markdown" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tag" name="tag"><input name="tag" className="input" /></Field>
          <Field label="Author" name="author"><input name="author" className="input" /></Field>
          <Field label="Status" name="status">
            <select name="status" className="input" defaultValue="draft">
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Hero image URL" name="hero_image"><input name="hero_image" className="input" /></Field>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/content/blog" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
