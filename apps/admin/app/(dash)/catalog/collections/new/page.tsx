import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createCollection(formData: FormData) {
  "use server";
  const title = String(formData.get("title") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim() || undefined;
  if (!title) redirect("/catalog/collections/new?error=Title+required");
  let r: { collection: { id: string } };
  try { r = await adminFetch("/admin/collections", { method: "POST", body: JSON.stringify({ title, handle }) }); }
  catch (e: any) { redirect(`/catalog/collections/new?error=${encodeURIComponent(e?.payload?.message ?? e?.message ?? "Failed")}`); }
  revalidatePath("/catalog/collections");
  redirect(`/catalog/collections/${r.collection.id}`);
}

export default async function NewCollection({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="New collection" back={{ href: "/catalog/collections", label: "Collections" }} />
      <form action={createCollection} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Title" name="title"><input name="title" required className="input" /></Field>
        <Field label="Handle" name="handle"><input name="handle" className="input" /></Field>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/catalog/collections" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
