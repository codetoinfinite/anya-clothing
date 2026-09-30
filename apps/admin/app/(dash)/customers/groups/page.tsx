import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Pagination } from "@/components/DataTable";
import { Field, FormError, DeleteConfirm } from "@/components/Form";
import { parseInt32, parseStr } from "@/lib/search-params";

type Group = { id: string; name: string };

async function createGroup(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/customers/groups?error=Name+required");
  try { await adminFetch("/admin/customer-groups", { method: "POST", body: JSON.stringify({ name }) }); }
  catch (e: any) { redirect(`/customers/groups?error=${encodeURIComponent(e?.payload?.message ?? "Failed")}`); }
  revalidatePath("/customers/groups");
  redirect("/customers/groups?ok=1");
}

async function deleteGroup(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/customer-groups/${id}`, { method: "DELETE" });
  revalidatePath("/customers/groups");
  redirect("/customers/groups");
}

export default async function GroupsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const limit = parseInt32(sp.limit, 25);
  const offset = parseInt32(sp.offset, 0);
  const q = parseStr(sp.q);
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q) params.set("q", q);
  const data = await adminFetch<{ customer_groups: Group[]; count: number }>(`/admin/customer-groups?${params}`);
  return (
    <div>
      <PageHeader title="Customer groups" />
      {parseStr(sp.error) ? <FormError message={parseStr(sp.error)!} /> : null}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <form action={createGroup} className="card p-4 space-y-3 md:col-span-1">
          <Field label="New group" name="name"><input name="name" required className="input" placeholder="VIP" /></Field>
          <button className="btn btn-primary w-full">Create</button>
        </form>
        <div className="md:col-span-2">
          <DataTable
            rows={data.customer_groups}
            columns={[
              { key: "name", header: "Name", cell: (r) => <div className="font-medium">{r.name}</div> },
              { key: "actions", header: "", cell: (r) => <DeleteConfirm action={deleteGroup} hidden={{ id: r.id }} label="Delete" /> },
            ]}
          />
          <Pagination basePath="/customers/groups" query={{ q }} limit={limit} offset={offset} total={data.count} />
        </div>
      </div>
    </div>
  );
}
