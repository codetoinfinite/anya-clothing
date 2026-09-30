import { redirect } from "next/navigation";
import Link from "next/link";
import { adminFetch } from "@/lib/medusa-admin";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createProduct(formData: FormData) {
  "use server";
  const title = String(formData.get("title") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim() || undefined;
  const description = String(formData.get("description") ?? "").trim() || undefined;
  const status = String(formData.get("status") ?? "draft");
  if (!title) redirect(`/catalog/products/new?error=${encodeURIComponent("Title is required")}`);
  let created: { product: { id: string } };
  try {
    created = await adminFetch<{ product: { id: string } }>("/admin/products", {
      method: "POST",
      body: JSON.stringify({
        title,
        handle,
        description,
        status,
        options: [{ title: "Default", values: ["Default"] }],
      }),
    });
  } catch (e: any) {
    const msg = e?.payload?.message ?? e?.message ?? "Failed to create";
    redirect(`/catalog/products/new?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/catalog/products");
  redirect(`/catalog/products/${created.product.id}`);
}

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-2xl">
      <PageHeader title="New product" back={{ href: "/catalog/products", label: "Products" }} />
      <form action={createProduct} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Title" name="title"><input name="title" required className="input" /></Field>
        <Field label="Handle" name="handle" hint="URL slug. Leave blank to auto-generate."><input name="handle" className="input" /></Field>
        <Field label="Description" name="description"><textarea name="description" rows={5} className="textarea" /></Field>
        <Field label="Status" name="status">
          <select name="status" defaultValue="draft" className="input">
            <option value="draft">Draft</option>
            <option value="proposed">Proposed</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Create</button>
          <Link href="/catalog/products" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
