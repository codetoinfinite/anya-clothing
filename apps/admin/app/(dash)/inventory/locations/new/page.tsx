import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createLocation(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const address_1 = String(formData.get("address_1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postal_code = String(formData.get("postal_code") ?? "").trim();
  const country_code = String(formData.get("country_code") ?? "").trim().toLowerCase();
  if (!name) redirect("/inventory/locations/new?error=Name+required");
  try {
    await adminFetch("/admin/stock-locations", {
      method: "POST",
      body: JSON.stringify({ name, address: { address_1, city, postal_code, country_code } }),
    });
  } catch (e: any) { redirect(`/inventory/locations/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/inventory/locations");
  redirect("/inventory/locations");
}

export default async function NewLocation({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="New stock location" back={{ href: "/inventory/locations", label: "Locations" }} />
      <form action={createLocation} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Name" name="name"><input name="name" required className="input" /></Field>
        <Field label="Address" name="address_1"><input name="address_1" className="input" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="City" name="city"><input name="city" className="input" /></Field>
          <Field label="Postal" name="postal_code"><input name="postal_code" className="input" /></Field>
          <Field label="Country" name="country_code"><input name="country_code" placeholder="us" className="input" /></Field>
        </div>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/inventory/locations" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
