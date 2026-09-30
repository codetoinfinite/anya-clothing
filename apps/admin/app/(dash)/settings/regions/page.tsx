import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminFetch } from "@/lib/medusa-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { DeleteConfirm } from "@/components/Form";

type Region = { id: string; name: string; currency_code: string; countries?: Array<{ iso_2: string }> };

async function deleteRegion(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await adminFetch(`/admin/regions/${id}`, { method: "DELETE" });
  revalidatePath("/settings/regions");
  redirect("/settings/regions");
}

export default async function RegionsPage() {
  const data = await adminFetch<{ regions: Region[] }>(`/admin/regions?fields=*countries`);
  return (
    <div>
      <PageHeader title="Regions" actions={<Link href="/settings/regions/new" className="btn btn-primary">New region</Link>} />
      <DataTable
        rows={data.regions}
        columns={[
          { key: "name", header: "Name", cell: (r) => <div className="font-medium">{r.name}</div> },
          { key: "currency", header: "Currency", cell: (r) => r.currency_code.toUpperCase() },
          { key: "countries", header: "Countries", cell: (r) => r.countries?.map((c) => c.iso_2.toUpperCase()).join(", ") || "—" },
          { key: "actions", header: "", cell: (r) => <DeleteConfirm action={deleteRegion} hidden={{ id: r.id }} label="Delete" /> },
        ]}
      />
    </div>
  );
}
