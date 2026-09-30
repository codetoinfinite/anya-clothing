import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";

type Cat = { id: string; name: string; handle: string; description?: string | null; is_active: boolean; is_internal: boolean };

async function updateCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const is_active = formData.get("is_active") === "on";
  try { await adminFetch(`/admin/product-categories/${id}`, { method: "POST", body: JSON.stringify({ name, handle, description, is_active }) }); }
  catch (e: any) { redirect(`/catalog/categories/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/catalog/categories");
  redirect(`/catalog/categories/${id}?ok=1`);
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/product-categories/${id}`, { method: "DELETE" });
  revalidatePath("/catalog/categories");
  redirect("/catalog/categories");
}

export default async function CategoryDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { product_category: c } = await adminFetch<{ product_category: Cat }>(`/admin/product-categories/${id}`);
  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title={c.name} back={{ href: "/catalog/categories", label: "Categories" }} />
      <form action={updateCategory} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={c.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <Field label="Name" name="name"><input name="name" defaultValue={c.name} required className="input" /></Field>
        <Field label="Handle" name="handle"><input name="handle" defaultValue={c.handle} className="input" /></Field>
        <Field label="Description" name="description"><textarea name="description" rows={4} defaultValue={c.description ?? ""} className="textarea" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={c.is_active} /> Active</label>
        <div className="flex gap-2"><button className="btn btn-primary">Save</button><Link href="/catalog/categories" className="btn btn-outline">Back</Link></div>
      </form>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deleteCategory} hidden={{ id }} label="Delete category" />
      </div>
    </div>
  );
}
