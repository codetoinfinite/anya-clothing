import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError } from "@/components/Form";

async function createPromo(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "standard");
  const value = Number(formData.get("value") ?? 0);
  const method_type = String(formData.get("method_type") ?? "percentage");
  const currency = String(formData.get("currency") ?? "usd").toLowerCase();
  const is_automatic = formData.get("is_automatic") === "on";
  if (!code) redirect("/sales/discounts/new?error=Code+required");
  let r: { promotion: { id: string } };
  try {
    r = await adminFetch("/admin/promotions", {
      method: "POST",
      body: JSON.stringify({
        code,
        type,
        is_automatic,
        application_method: {
          type: method_type,
          value,
          currency_code: method_type === "fixed" ? currency : undefined,
          target_type: "items",
          allocation: "across",
        },
      }),
    });
  } catch (e: any) { redirect(`/sales/discounts/new?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/sales/discounts");
  redirect(`/sales/discounts/${r.promotion.id}`);
}

export default async function NewDiscount({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="New discount" back={{ href: "/sales/discounts", label: "Discounts" }} />
      <form action={createPromo} className="card p-6 space-y-4">
        <FormError message={sp.error} />
        <Field label="Code" name="code"><input name="code" required className="input" placeholder="SUMMER10" /></Field>
        <Field label="Type" name="type">
          <select name="type" className="input" defaultValue="standard">
            <option value="standard">Standard</option>
            <option value="buyget">Buy X get Y</option>
          </select>
        </Field>
        <Field label="Method" name="method_type">
          <select name="method_type" className="input" defaultValue="percentage">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </Field>
        <Field label="Value" name="value"><input name="value" type="number" step="0.01" required className="input" /></Field>
        <Field label="Currency (fixed only)" name="currency"><input name="currency" defaultValue="usd" className="input" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_automatic" /> Apply automatically</label>
        <div className="flex gap-2"><button className="btn btn-primary">Create</button><Link href="/sales/discounts" className="btn btn-outline">Cancel</Link></div>
      </form>
    </div>
  );
}
