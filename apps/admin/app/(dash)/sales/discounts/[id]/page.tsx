import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { Field, FormError, DeleteConfirm } from "@/components/Form";

type Promo = {
  id: string;
  code: string;
  type: string;
  is_automatic: boolean;
  status: string;
  application_method?: { type: string; value: number; currency_code?: string };
};

async function updatePromo(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const is_automatic = formData.get("is_automatic") === "on";
  try { await adminFetch(`/admin/promotions/${id}`, { method: "POST", body: JSON.stringify({ code, is_automatic }) }); }
  catch (e: any) { redirect(`/sales/discounts/${id}?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/sales/discounts");
  redirect(`/sales/discounts/${id}?ok=1`);
}

async function deletePromo(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/promotions/${id}`, { method: "DELETE" });
  revalidatePath("/sales/discounts");
  redirect("/sales/discounts");
}

export default async function PromoDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { promotion: p } = await adminFetch<{ promotion: Promo }>(`/admin/promotions/${id}?fields=*application_method`);
  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title={p.code} back={{ href: "/sales/discounts", label: "Discounts" }} subtitle={p.application_method ? (p.application_method.type === "percentage" ? `${p.application_method.value}% off` : `${p.application_method.value} ${p.application_method.currency_code ?? ""} off`) : ""} />
      <form action={updatePromo} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={p.id} />
        <FormError message={sp.error} />
        {sp.ok ? <div className="text-sm text-[var(--color-success)]">Saved.</div> : null}
        <Field label="Code" name="code"><input name="code" defaultValue={p.code} className="input" required /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_automatic" defaultChecked={p.is_automatic} /> Automatic</label>
        <div className="flex gap-2"><button className="btn btn-primary">Save</button><Link href="/sales/discounts" className="btn btn-outline">Back</Link></div>
      </form>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">Danger zone</h2>
        <DeleteConfirm action={deletePromo} hidden={{ id }} label="Delete discount" />
      </div>
    </div>
  );
}
