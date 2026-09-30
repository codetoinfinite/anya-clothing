import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";
import { Badge } from "@/components/DataTable";

type Variant = { id: string; title: string; sku?: string | null; manage_inventory?: boolean; inventory_quantity?: number | null };
type AdminProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  status: string;
  thumbnail?: string | null;
  variants?: Variant[];
};

async function updateProduct(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null;
  if (!title) redirect(`/catalog/products/${id}?error=${encodeURIComponent("Title is required")}`);
  try {
    await adminFetch(`/admin/products/${id}`, {
      method: "POST",
      body: JSON.stringify({ title, handle, description, status, thumbnail }),
    });
  } catch (e: any) {
    const msg = e?.payload?.message ?? e?.message ?? "Update failed";
    redirect(`/catalog/products/${id}?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/catalog/products");
  revalidatePath(`/catalog/products/${id}`);
  redirect(`/catalog/products/${id}?ok=1`);
}

async function deleteProduct(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
  revalidatePath("/catalog/products");
  redirect("/catalog/products");
}

export default async function ProductDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { product } = await adminFetch<{ product: AdminProduct }>(`/admin/products/${id}?fields=*variants`);
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={product.title}
        back={{ href: "/catalog/products", label: "Products" }}
        subtitle={`/${product.handle}`}
        actions={<Badge tone={product.status === "published" ? "success" : "warn"}>{product.status}</Badge>}
      />
      <form action={updateProduct} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <Field label="Title" name="title"><input name="title" required defaultValue={product.title} className="input" /></Field>
        <Field label="Handle" name="handle"><input name="handle" defaultValue={product.handle} className="input" /></Field>
        <Field label="Description" name="description"><textarea name="description" rows={6} defaultValue={product.description ?? ""} className="textarea" /></Field>
        <Field label="Thumbnail URL" name="thumbnail"><input name="thumbnail" defaultValue={product.thumbnail ?? ""} className="input" /></Field>
        <Field label="Status" name="status">
          <select name="status" defaultValue={product.status} className="input">
            <option value="draft">Draft</option>
            <option value="proposed">Proposed</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link href="/catalog/products" className="btn btn-outline">Back</Link>
        </div>
      </form>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Variants</h2>
          <span className="text-sm text-[var(--color-ink-muted)]">{product.variants?.length ?? 0}</span>
        </div>
        {product.variants?.length ? (
          <table className="table">
            <thead><tr><th>Title</th><th>SKU</th><th>Inventory</th></tr></thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id}><td>{v.title}</td><td>{v.sku ?? "—"}</td><td>{v.manage_inventory ? v.inventory_quantity ?? 0 : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-sm text-[var(--color-ink-muted)]">No variants.</div>}
      </div>

      <div className="card p-6 border-[var(--color-danger)] border-opacity-30">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <p className="text-sm text-[var(--color-ink-muted)] mb-3">Delete this product permanently.</p>
        <DeleteConfirm action={deleteProduct} hidden={{ id: product.id }} label="Delete product" />
      </div>
    </div>
  );
}
