import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createCategory(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim() || undefined;
  const description = String(formData.get("description") ?? "").trim() || undefined;
  const is_active = formData.get("is_active") === "on";
  if (!name) redirect("/catalog/categories/new?error=Name+required");
  let r: { product_category: { id: string } };
  try { r = await adminFetch("/admin/product-categories", { method: "POST", body: JSON.stringify({ name, handle, description, is_active }) }); }
  catch (e: any) { redirect(`/catalog/categories/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/catalog/categories");
  redirect(`/catalog/categories/${r.product_category.id}`);
}

export default async function NewCategory({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="New category" back={{ href: "/catalog/categories", label: "Categories" }} />
      <form action={createCategory} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Name" name="name"><input name="name" required className="input" /></Field>
        <Field label="Handle" name="handle"><input name="handle" className="input" /></Field>
        <Field label="Description" name="description"><textarea name="description" rows={3} className="textarea" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Active</label>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/catalog/categories" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
