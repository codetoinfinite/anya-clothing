import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";
import { formatDate } from "@/lib/utils";

type Address = { id: string; address_1: string; city: string; postal_code: string; country_code: string };
type Customer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  has_account: boolean;
  created_at: string;
  addresses?: Address[];
};

async function updateCustomer(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  try { await adminFetch(`/admin/customers/${id}`, { method: "POST", body: JSON.stringify({ first_name, last_name, phone }) }); }
  catch (e: any) { redirect(`/customers/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}?ok=1`);
}

async function deleteCustomer(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/customers/${id}`, { method: "DELETE" });
  revalidatePath("/customers");
  redirect("/customers");
}

export default async function CustomerDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { customer: c } = await adminFetch<{ customer: Customer }>(`/admin/customers/${id}?fields=*addresses`);
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={c.email} back={{ href: "/customers", label: "Customers" }} subtitle={`Joined ${formatDate(c.created_at)} · ${c.has_account ? "account" : "guest"}`} />
      <form action={updateCustomer} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={c.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" name="first_name"><input name="first_name" defaultValue={c.first_name ?? ""} className="input" /></Field>
          <Field label="Last name" name="last_name"><input name="last_name" defaultValue={c.last_name ?? ""} className="input" /></Field>
        </div>
        <Field label="Phone" name="phone"><input name="phone" defaultValue={c.phone ?? ""} className="input" /></Field>
        <div className="flex gap-2"><button className="btn btn-primary">Save</button><Link href="/customers" className="btn btn-outline">Back</Link></div>
      </form>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Addresses</h2>
        {c.addresses?.length ? (
          <ul className="text-sm space-y-2">
            {c.addresses.map((a) => <li key={a.id}>{a.address_1}, {a.city} {a.postal_code} ({a.country_code?.toUpperCase()})</li>)}
          </ul>
        ) : <div className="text-sm text-[var(--color-ink-muted)]">No saved addresses.</div>}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deleteCustomer} hidden={{ id }} label="Delete customer" />
      </div>
    </div>
  );
}
