import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createRegion(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const currency_code = String(formData.get("currency_code") ?? "").trim().toLowerCase();
  const countries = String(formData.get("countries") ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!name || !currency_code) redirect("/settings/regions/new?error=Name+and+currency+required");
  try { await adminFetch("/admin/regions", { method: "POST", body: JSON.stringify({ name, currency_code, countries }) }); }
  catch (e: any) { redirect(`/settings/regions/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/settings/regions");
  redirect("/settings/regions");
}

export default async function NewRegion({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="New region" back={{ href: "/settings/regions", label: "Regions" }} />
      <form action={createRegion} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Name" name="name"><input name="name" required className="input" /></Field>
        <Field label="Currency" name="currency_code"><input name="currency_code" required placeholder="usd" className="input" /></Field>
        <Field label="Countries (ISO-2, comma)" name="countries"><input name="countries" placeholder="us, ca, gb" className="input" /></Field>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/settings/regions" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
