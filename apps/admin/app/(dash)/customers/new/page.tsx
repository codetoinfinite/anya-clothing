import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createCustomer(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const first_name = String(formData.get("first_name") ?? "").trim() || undefined;
  const last_name = String(formData.get("last_name") ?? "").trim() || undefined;
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  if (!email) redirect("/customers/new?error=Email+required");
  let r: { customer: { id: string } };
  try { r = await adminFetch("/admin/customers", { method: "POST", body: JSON.stringify({ email, first_name, last_name, phone }) }); }
  catch (e: any) { redirect(`/customers/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/customers");
  redirect(`/customers/${r.customer.id}`);
}

export default async function NewCustomer({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="New customer" back={{ href: "/customers", label: "Customers" }} />
      <form action={createCustomer} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Email" name="email"><input name="email" type="email" required className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" name="first_name"><input name="first_name" className="input" /></Field>
          <Field label="Last name" name="last_name"><input name="last_name" className="input" /></Field>
        </div>
        <Field label="Phone" name="phone"><input name="phone" className="input" /></Field>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/customers" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
