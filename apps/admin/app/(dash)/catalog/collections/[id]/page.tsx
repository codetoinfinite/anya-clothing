import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";

type Coll = { id: string; title: string; handle: string };

async function updateCollection(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim();
  try { await adminFetch(`/admin/collections/${id}`, { method: "POST", body: JSON.stringify({ title, handle }) }); }
  catch (e: any) { redirect(`/catalog/collections/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/catalog/collections");
  redirect(`/catalog/collections/${id}?ok=1`);
}

async function deleteCollection(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/collections/${id}`, { method: "DELETE" });
  revalidatePath("/catalog/collections");
  redirect("/catalog/collections");
}

export default async function CollectionDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { collection } = await adminFetch<{ collection: Coll }>(`/admin/collections/${id}`);
  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title={collection.title} back={{ href: "/catalog/collections", label: "Collections" }} />
      <form action={updateCollection} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={collection.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <Field label="Title" name="title"><input name="title" defaultValue={collection.title} required className="input" /></Field>
        <Field label="Handle" name="handle"><input name="handle" defaultValue={collection.handle} className="input" /></Field>
        <div className="flex gap-2"><button className="btn btn-primary">Save</button><Link href="/catalog/collections" className="btn btn-outline">Back</Link></div>
      </form>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deleteCollection} hidden={{ id }} label="Delete collection" />
      </div>
    </div>
  );
}
